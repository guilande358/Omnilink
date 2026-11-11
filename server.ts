import express from 'express';
import fs from 'fs';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import crypto from 'crypto';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, doc, setDoc, collection, query, where, getDocs } from 'firebase/firestore';
import firebaseConfig from './firebase-applet-config.json';

dotenv.config();

const app = express();
app.set('trust proxy', true);
// Dev server in AI Studio must strictly run on port 3000
const PORT = 3000;

// Initialize Firebase App for Server-Side Webhook Firestore Updates
const firebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig, 'serverApp') : getApp('serverApp');
const db = getFirestore(firebaseApp, firebaseConfig.firestoreDatabaseId);

// Official Production Base URL
const OFFICIAL_APP_ORIGIN = 'https://omnilinksbio.ai.studio';

// Walled Recurring Billing Configuration
const WALLED_API_BASE_URL = process.env.WALLED_API_BASE_URL || 'https://api.trywalled.com/api/v1/integrations';
const WALLED_PLAN_ID = process.env.WALLED_PLAN_ID || '46eb2f0b-5548-42e5-a0bd-aacdc879c6be';
const WALLED_API_KEY = process.env.WALLED_API_KEY || 'sk_test_ZBHIGoI5FF5WQoBUByX0ZZ7SUHSs6nJGXRp4tq0v-IE';
const WALLED_WEBHOOK_SECRET = process.env.WALLED_WEBHOOK_SECRET || '';

// Deduplication cache for Walled webhook events
const processedEventIds = new Set<string>();

// Persistent file-backed user repository for server-side auth fallback
const USERS_FILE_PATH = path.join(process.cwd(), '.server_users.json');

interface StoredUser {
  id: string;
  name: string;
  email: string;
  username: string;
  isPro: boolean;
  avatarUrl?: string;
  passwordHash?: string;
  createdAt: string;
  updatedAt: string;
}

function loadServerUsers(): StoredUser[] {
  try {
    if (!fs.existsSync(USERS_FILE_PATH)) {
      return [];
    }
    const content = fs.readFileSync(USERS_FILE_PATH, 'utf-8');
    return JSON.parse(content) || [];
  } catch {
    return [];
  }
}

function saveServerUsers(users: StoredUser[]): void {
  try {
    fs.writeFileSync(USERS_FILE_PATH, JSON.stringify(users, null, 2), 'utf-8');
  } catch (err) {
    console.error('[Server Users] Could not save users file:', err);
  }
}

// Raw body parser for webhook signature verification (/api/webhooks/trywalled and /api/walled/webhook)
app.use((req, res, next) => {
  if (req.originalUrl === '/api/webhooks/trywalled' || req.originalUrl === '/api/walled/webhook') {
    let data = '';
    req.setEncoding('utf8');
    req.on('data', (chunk) => {
      data += chunk;
    });
    req.on('end', () => {
      (req as any).rawBody = data;
      try {
        req.body = data ? JSON.parse(data) : {};
      } catch {
        req.body = {};
      }
      next();
    });
  } else {
    express.json()(req, res, next);
  }
});

// Initialize GoogleGenAI server-side client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// ==========================================
// WALLED RECURRING BILLING ENDPOINTS
// ==========================================

// 1. Create Walled Checkout Session
app.post('/api/walled/checkout-session', async (req, res) => {
  try {
    const { customerRef: bodyCustomerRef, attemptId: clientAttemptId } = req.body;
    const authHeader = req.headers.authorization || '';
    const tokenUid = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : '';
    const rawRef = bodyCustomerRef || tokenUid;

    if (!rawRef || typeof rawRef !== 'string' || rawRef.trim() === '' || rawRef === 'customer_anonymous_ref' || rawRef === 'anonymous') {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized: É necessário estar autenticado para assinar o OmniLink Pro (customerRef do Firebase Auth UID é obrigatório).',
      });
    }
    const customerRef = rawRef.trim();
    const attemptId = clientAttemptId || crypto.randomUUID();

    // Determine clean HTTPS origin for return URLs (strictly https, never localhost)
    let origin = process.env.APP_ORIGIN;
    if (!origin) {
      const forwardedHost = (req.get('x-forwarded-host') || req.get('host') || '')
        .replace(/^[a-zA-Z]+:\/\//, '')
        .replace(/^[^@]+@/, '');

      if (forwardedHost && !forwardedHost.includes('localhost') && !forwardedHost.includes('127.0.0.1')) {
        origin = `https://${forwardedHost}`;
      } else {
        origin = OFFICIAL_APP_ORIGIN;
      }
    }
    // Guarantee https protocol and eliminate any trailing slash or localhost
    if (!origin.startsWith('https://') || origin.includes('localhost') || origin.includes('127.0.0.1')) {
      origin = OFFICIAL_APP_ORIGIN;
    }
    origin = origin.replace(/\/+$/, '');

    const idempotencyKey = `${WALLED_PLAN_ID}-${customerRef}-${attemptId}`;

    console.log(`[Walled Checkout] Initializing session for customerRef: ${customerRef}, attemptId: ${attemptId}, origin: ${origin}`);

    const payload = {
      planId: WALLED_PLAN_ID,
      customerRef,
      successUrl: `${origin}/billing/success`,
      cancelUrl: `${origin}/billing/cancel`,
    };

    const walledResponse = await fetch(`${WALLED_API_BASE_URL}/checkout/sessions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${WALLED_API_KEY}`,
        'Content-Type': 'application/json',
        'Idempotency-Key': idempotencyKey,
      },
      body: JSON.stringify(payload),
    });

    const walledData: any = await walledResponse.json();

    if (!walledResponse.ok) {
      const rawDetail = walledData?.detail || walledData?.message || walledData?.error || 'Failed to create Walled checkout session';
      const detailStr = typeof rawDetail === 'string' ? rawDetail : JSON.stringify(rawDetail);
      console.error('[Walled Checkout Error]', detailStr);

      let userFriendlyError = detailStr;
      let requiresDomainConfig = false;

      if (detailStr.toLowerCase().includes('allowed domain')) {
        requiresDomainConfig = true;
        userFriendlyError = 'Domínio não configurado no Trywalled: acesse o seu painel em trywalled.com, abra as configurações do plano "Omnilink Smart Bio & Social Profiles" e adicione o domínio permitido (Allowed Domain): "omnilinksbio.ai.studio".';
      }

      return res.status(walledResponse.status).json({
        success: false,
        error: userFriendlyError,
        rawDetail: detailStr,
        requiresDomainConfig,
        domainToConfigure: 'omnilinksbio.ai.studio',
      });
    }

    res.json({
      success: true,
      checkoutUrl: walledData.checkoutUrl || walledData.url || walledData.sessionUrl,
      sessionId: walledData.id || walledData.sessionId,
      attemptId,
      customerRef,
      billingSupportUrl: walledData.billingSupportUrl,
      raw: walledData,
    });
  } catch (error: any) {
    console.error('[Walled Checkout Server Error]', error);
    res.status(500).json({ success: false, error: error.message || 'Server error creating checkout session' });
  }
});

// 2. Query Walled Subscription Status
app.get('/api/walled/subscription-status', async (req, res) => {
  try {
    const customerRef = (req.query.customerRef as string) || 'customer_anonymous_ref';

    console.log(`[Walled Lookup] Fetching subscriptions for customerRef: ${customerRef}`);

    const url = `${WALLED_API_BASE_URL}/subscriptions?customerRef=${encodeURIComponent(customerRef)}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${WALLED_API_KEY}`,
      },
    });

    const data: any = await response.json();

    if (!response.ok) {
      console.error('[Walled Subscription Lookup Error]', data);
      return res.status(response.status).json({ success: false, error: data?.message || 'Failed to fetch subscription' });
    }

    const subscriptions = Array.isArray(data) ? data : data.data || [data];
    
    // Confirm planId, environment = test, and status = trialing or active
    const validSubscription = subscriptions.find((sub: any) => {
      const matchPlan = sub.planId === WALLED_PLAN_ID;
      const matchEnv = sub.environment === 'test' || !sub.environment;
      const matchStatus = sub.status === 'trialing' || sub.status === 'active';
      return matchPlan && matchEnv && matchStatus;
    });

    if (validSubscription) {
      // Synchronously update Firestore document state on server
      await updateFirestoreUserPlanStatus(customerRef, true, {
        subscriptionId: validSubscription.id,
        status: validSubscription.status,
        billingSupportUrl: validSubscription.billingSupportUrl || data.billingSupportUrl,
      });

      return res.json({
        success: true,
        isConfirmed: true,
        status: validSubscription.status,
        subscriptionId: validSubscription.id,
        planId: validSubscription.planId,
        environment: validSubscription.environment || 'test',
        billingSupportUrl: validSubscription.billingSupportUrl || data.billingSupportUrl,
        raw: validSubscription,
      });
    }

    res.json({
      success: true,
      isConfirmed: false,
      status: subscriptions[0]?.status || 'none',
      message: 'No active or trialing subscription confirmed for this plan.',
    });
  } catch (error: any) {
    console.error('[Walled Subscription Status Error]', error);
    res.status(500).json({ success: false, error: error.message || 'Server error fetching subscription status' });
  }
});

// Helper function to update user plan status in Firestore with robust error logging
async function updateFirestoreUserPlanStatus(
  customerRef: string,
  isPro: boolean,
  details?: {
    subscriptionId?: string;
    status?: string;
    billingSupportUrl?: string;
  }
) {
  if (!customerRef) {
    console.error('[Firestore Plan Update Error] Cannot update plan: customerRef is missing or empty.');
    return;
  }

  console.log(`[Firestore Plan Update] Updating plan for customerRef: ${customerRef}, isPro: ${isPro}, status: ${details?.status || (isPro ? 'active' : 'canceled')}`);

  try {
    const now = new Date().toISOString();
    const targetUserIds = new Set<string>();

    // Add direct customerRef (Auth UID or primary identifier)
    targetUserIds.add(customerRef);

    // Query bios collection where username matches customerRef
    try {
      const bioQuery = query(collection(db, 'bios'), where('username', '==', customerRef.toLowerCase()));
      const bioSnap = await getDocs(bioQuery);
      bioSnap.forEach((d) => targetUserIds.add(d.id));
    } catch (err) {
      console.error(`[Firestore Plan Update Error] Failed querying bios for username '${customerRef}':`, err);
    }

    // Query users collection where email matches customerRef
    try {
      const userQuery = query(collection(db, 'users'), where('email', '==', customerRef.toLowerCase()));
      const userSnap = await getDocs(userQuery);
      userSnap.forEach((d) => targetUserIds.add(d.id));
    } catch (err) {
      console.error(`[Firestore Plan Update Error] Failed querying users for email '${customerRef}':`, err);
    }

    // Also update server-stored accounts if customerRef matches
    try {
      const serverUsers = loadServerUsers();
      let updatedServer = false;
      for (const u of serverUsers) {
        if (
          u.id === customerRef ||
          u.email.toLowerCase() === customerRef.toLowerCase() ||
          u.username.toLowerCase() === customerRef.toLowerCase()
        ) {
          u.isPro = isPro;
          u.updatedAt = now;
          updatedServer = true;
          console.log(`[Server Users Plan Update] Updated server user @${u.username} to isPro: ${isPro}`);
        }
      }
      if (updatedServer) {
        saveServerUsers(serverUsers);
      }
    } catch (e) {
      console.warn('[Server Users Plan Update Error]', e);
    }

    // Update all matching docs in bios and users collections
    for (const userId of targetUserIds) {
      try {
        const bioRef = doc(db, 'bios', userId);
        await setDoc(
          bioRef,
          {
            isPro,
            showWatermark: !isPro,
            subscriptionStatus: details?.status || (isPro ? 'active' : 'canceled'),
            ...(details?.subscriptionId ? { walledSubscriptionId: details.subscriptionId } : {}),
            ...(details?.billingSupportUrl ? { billingSupportUrl: details.billingSupportUrl } : {}),
            updatedAt: now,
          },
          { merge: true }
        );
        console.log(`[Firestore Plan Update] Successfully updated bio document: bios/${userId} (isPro: ${isPro}, showWatermark: ${!isPro})`);
      } catch (e) {
        console.error(`[Firestore Plan Update Error] Failed updating bio document bios/${userId}:`, e);
      }

      try {
        const userRef = doc(db, 'users', userId);
        await setDoc(
          userRef,
          {
            isPro,
            updatedAt: now,
          },
          { merge: true }
        );
        console.log(`[Firestore Plan Update] Successfully updated user document: users/${userId} (isPro: ${isPro})`);
      } catch (e) {
        console.error(`[Firestore Plan Update Error] Failed updating user document users/${userId}:`, e);
      }
    }
  } catch (err) {
    console.error(`[Firestore Plan Update Critical Failure] Error updating plan for customerRef '${customerRef}':`, err);
  }
}

// Signature Verification Helper for Walled Webhooks (Strict HMAC SHA-256)
function verifyWalledSignature(rawBody: string, signatureHeader?: string, secret?: string): boolean {
  if (!secret) {
    console.warn('[Walled Webhook Security] WALLED_WEBHOOK_SECRET is not configured. Allowing test events.');
    return true;
  }
  if (!signatureHeader) {
    console.error('[Walled Webhook Security] Missing signature header (walled-signature/x-walled-signature) while WALLED_WEBHOOK_SECRET is configured.');
    return false;
  }

  try {
    let signatureToCompare = signatureHeader.trim();
    let timestamp = '';

    // Extract signature if in t=timestamp,v1=signature format (Stripe / Walled standard)
    if (signatureToCompare.includes('v1=')) {
      const parts = signatureToCompare.split(',');
      const v1Part = parts.find((p) => p.trim().startsWith('v1='));
      if (v1Part) {
        signatureToCompare = v1Part.split('=')[1].trim();
      }
      const tPart = parts.find((p) => p.trim().startsWith('t='));
      if (tPart) {
        timestamp = tPart.split('=')[1].trim();
      }
    }

    // Direct HMAC-SHA256 on raw body
    const hmacDirect = crypto.createHmac('sha256', secret);
    const expectedDirectHex = hmacDirect.update(rawBody).digest('hex');

    const bufHeader = Buffer.from(signatureToCompare);
    const bufDirect = Buffer.from(expectedDirectHex);

    if (bufHeader.length === bufDirect.length && crypto.timingSafeEqual(bufHeader, bufDirect)) {
      return true;
    }

    // Timestamp-prefixed HMAC (${timestamp}.${rawBody})
    if (timestamp) {
      const hmacTimed = crypto.createHmac('sha256', secret);
      const expectedTimedHex = hmacTimed.update(`${timestamp}.${rawBody}`).digest('hex');
      const bufTimed = Buffer.from(expectedTimedHex);
      if (bufHeader.length === bufTimed.length && crypto.timingSafeEqual(bufHeader, bufTimed)) {
        return true;
      }
    }

    console.error('[Walled Webhook Security] Cryptographic HMAC-SHA256 signature mismatch.');
    return false;
  } catch (err) {
    console.error('[Walled Webhook Security] Exception during signature verification:', err);
    return false;
  }
}

// 3. Walled Webhook Handler Processing /api/webhooks/trywalled & /api/walled/webhook
async function handleWalledWebhookEvent(req: express.Request, res: express.Response) {
  const rawBody = (req as any).rawBody || JSON.stringify(req.body);
  const signature = (req.headers['walled-signature'] || req.headers['x-walled-signature']) as string;

  // 1. Strict HMAC SHA-256 Signature Verification: If WALLED_WEBHOOK_SECRET is configured and fails, return 401 immediately
  if (WALLED_WEBHOOK_SECRET) {
    const isValid = verifyWalledSignature(rawBody, signature, WALLED_WEBHOOK_SECRET);
    if (!isValid) {
      console.error('[Walled Webhook Security] Unauthorized request rejected (401): Invalid or missing signature.');
      return res.status(401).json({
        success: false,
        error: 'Unauthorized: Invalid Walled webhook signature',
      });
    }
  } else {
    console.warn('[Walled Webhook Security] WALLED_WEBHOOK_SECRET not set in environment. Processing event in test mode.');
  }

  const event = req.body || {};
  const eventId = event?.id || event?.eventId;

  if (eventId && processedEventIds.has(eventId)) {
    console.log(`[Walled Webhook] Deduplicated event ID: ${eventId}`);
    return res.json({ received: true, deduplicated: true });
  }

  if (eventId) {
    processedEventIds.add(eventId);
  }

  const eventType = event.type || event.event || '';
  const data = event.data || event.payload || event;
  const customerRef = data.customerRef || data.customer_ref || data.customer || 'omnilink_customer';
  const status = data.status || 'active';
  const subscriptionId = data.id || data.subscriptionId;
  const billingSupportUrl = data.billingSupportUrl;

  console.log(`[Walled Webhook Received] Type: '${eventType}' | CustomerRef: '${customerRef}' | Status: '${status}'`);

  // 2. Comprehensive billing state handling (switch/case)
  try {
    switch (eventType) {
      case 'subscription.created':
      case 'subscription.updated':
      case 'subscription.payment_succeeded': {
        const isStatusActiveOrTrialing = status === 'active' || status === 'trialing';
        // For payment_succeeded, billing payment succeeded, so user is Pro unless status is explicitly canceled
        const isPro = eventType === 'subscription.payment_succeeded' ? (status !== 'canceled' && status !== 'payment_failed') : isStatusActiveOrTrialing;

        await updateFirestoreUserPlanStatus(customerRef, isPro, {
          subscriptionId,
          status: isPro ? (status === 'trialing' ? 'trialing' : 'active') : status,
          billingSupportUrl,
        });

        console.log(`[Walled Webhook Processed] Event: ${eventType} | Customer: ${customerRef} | Status: ${status} | isPro: ${isPro} | showWatermark: ${!isPro}`);
        break;
      }

      case 'subscription.canceled':
      case 'subscription.payment_failed': {
        // Synchronously revoke Pro access and restore watermark
        await updateFirestoreUserPlanStatus(customerRef, false, {
          subscriptionId,
          status: eventType === 'subscription.canceled' ? 'canceled' : 'payment_failed',
          billingSupportUrl,
        });

        console.log(`[Walled Webhook Processed] Event: ${eventType} | Customer: ${customerRef} | Revoked Pro access (isPro: false, showWatermark: true)`);
        break;
      }

      default:
        console.log(`[Walled Webhook] Unhandled event type: '${eventType}' for customerRef: '${customerRef}'`);
    }
  } catch (eventErr) {
    console.error(`[Walled Webhook Processing Error] Failed handling event '${eventType}':`, eventErr);
    return res.status(500).json({
      success: false,
      error: 'Internal server error processing webhook event',
    });
  }

  res.json({
    received: true,
    success: true,
    eventType,
    customerRef,
    status,
  });
}

app.post('/api/webhooks/trywalled', handleWalledWebhookEvent);
app.post('/api/walled/webhook', handleWalledWebhookEvent);

// Status check and metadata endpoint for webhook integration
app.get(['/api/webhooks/trywalled', '/api/walled/webhook'], (_req, res) => {
  res.json({
    status: 'active',
    endpoint: `${OFFICIAL_APP_ORIGIN}/api/webhooks/trywalled`,
    service: 'OmniLink Walled Webhook Handler',
    supportedEvents: [
      'subscription.created',
      'subscription.updated',
      'subscription.canceled',
      'subscription.payment_succeeded',
      'subscription.payment_failed',
    ],
  });
});

// Authentication endpoints
app.post('/api/auth/google', (req, res) => {
  try {
    const { email, name, picture } = req.body;
    const googleEmail = (email || 'user.google@gmail.com').trim().toLowerCase();
    const googleName = name || 'Google Creator';
    const username = googleEmail.split('@')[0].toLowerCase().replace(/[^a-z0-9_]/g, '');

    const users = loadServerUsers();
    let existingDoc = users.find((u) => u.email === googleEmail);
    let userId = existingDoc ? existingDoc.id : `usr_google_${crypto.randomBytes(8).toString('hex')}`;
    let isPro = existingDoc ? !!existingDoc.isPro : false;

    if (!existingDoc) {
      existingDoc = {
        id: userId,
        name: googleName,
        email: googleEmail,
        username,
        avatarUrl: picture || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
        isPro: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      users.push(existingDoc);
      saveServerUsers(users);
    }

    console.log(`[Google Auth] Signed in as ${googleName} (${googleEmail}, uid: ${userId})`);
    res.json({
      success: true,
      message: 'Authenticated via Google successfully!',
      user: {
        id: userId,
        name: googleName,
        email: googleEmail,
        username,
        avatarUrl: picture || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
        isPro,
      },
    });
  } catch (err: any) {
    console.error('[Google Auth Error]', err);
    res.status(500).json({ success: false, message: 'Google Auth error' });
  }
});

// 1-Click AI Full Profile Creator Endpoint
app.post('/api/ai/full-profile', async (req, res) => {
  try {
    const { niche, prompt } = req.body;

    const systemInstruction = `You are an elite global SaaS conversion copywriter. Your goal is to generate a COMPLETE, HIGH-CONVERTING link-in-bio profile in JSON format for a global business, freelancer, or digital creator.
Always follow international copywriting and SaaS conversion best practices:
- Detect the user's input language and respond in that exact language (primarily English or Global Portuguese).
- Use global currency notation, defaulting to Dollars ($ / USD) for prices or metrics unless specified otherwise.
- Focus the copy on universal digital triggers: high click-through rates (CTR), clear Call to Actions (CTAs), lead magnet attraction, and social proof.
- Ensure the testimonials look realistic, professional, and trustworthy for an international audience.
Return a valid JSON object with the exact keys: displayName, bio, leadFormHeadline, leadFormButtonText, whatsappWelcomeMessage, links (array of objects with title, url, isHighlighted), and testimonials (array of objects with clientName, clientRole, rating, comment).`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `Business Niche: ${niche || 'Digital SaaS Creator & Consultant'}\nUser prompt: ${prompt || 'Create a full profile with high conversion'}`,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
      },
    });

    const text = response.text || '{}';
    let profileData = {};
    try {
      profileData = JSON.parse(text);
    } catch {
      profileData = {
        displayName: niche || 'Global Digital Creator',
        bio: 'High-converting digital services & products for founders, freelancers, and creators worldwide.',
        leadFormHeadline: 'Get Free Global Growth Guide ($0)',
        leadFormButtonText: 'Download Free Guide',
        whatsappWelcomeMessage: 'Hello! I saw your link on OmniLink and would love to collaborate.',
        links: [
          { title: '⚡ Best Seller Offer ($29)', url: 'https://example.com/offer', isHighlighted: true },
          { title: '🛍️ Shop Products Online', url: 'https://example.com/shop', isHighlighted: false },
          { title: '📅 Book 1:1 Consultation Call', url: 'https://calendly.com', isHighlighted: false },
          { title: '💬 Chat on WhatsApp Direct', url: 'https://wa.me', isHighlighted: false },
        ],
        testimonials: [
          { clientName: 'Sarah M.', clientRole: 'Verified Global Buyer', rating: 5, comment: 'Outstanding quality and fast delivery! Boosted our CTR immediately.' },
          { clientName: 'David K.', clientRole: 'Product Lead', rating: 5, comment: 'Highly recommended! Increased our international conversions right away.' },
        ],
      };
    }

    res.json({ success: true, profileData });
  } catch (error: any) {
    console.error('Gemini Full Profile Error:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to generate full profile' });
  }
});

// Multi-turn Conversational AI Refinement & Architecture Engine ("Continuar a Conversa")
// Enforces Strict Data Sandbox & User Scope Isolation
app.post('/api/ai/chat-refine', async (req, res) => {
  try {
    const authHeader = req.headers.authorization || '';
    const tokenUid = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : '';
    const userId = (req.body.userId || tokenUid || '').trim();

    // 1. Strict Authentication & Scope Isolation: Reject unauthenticated requests with HTTP 401
    if (!userId || userId === 'anonymous' || userId === 'customer_anonymous_ref') {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized: Autenticação obrigatória para utilizar o assistente de refinamento IA.',
      });
    }

    const { message, currentProfile, currentLinks, currentTestimonials, chatHistory } = req.body;

    // 2. Conversion Architecture & Progressive Form System Instruction
    const systemInstruction = `You are OmniLink's Elite Conversion Architecture Engine and Interactive Profile Builder.
Your role is to act as a World-Class SaaS & Link-in-Bio Conversion Architect, turning the user's niche and goals into a high-converting profile structure and guiding them through an interactive, progressive chat form.

STRICT CONVERSION ARCHITECT & INTERACTIVE FORM RULES:
1. INTENT RECOGNITION & ARCHITECTURE PROPOSAL:
   - When the user mentions their niche, industry, profession, or business goal, analyze what structural components are ESSENTIAL for their specific market:
     * High-converting Links (primary CTA, catalog, booking, contact)
     * Lead Magnet Capture Form (headline, button label, freebie offer)
     * Social Proof / Testimonials Carousel (ratings, client validation)
     * Direct WhatsApp Floating Action Button (with high-converting welcome message)
     * Digital Products / Portfolio Gallery
     * Interactive Featured Video / Reel Player
     * Tip Jar / Direct Monetization
     * Visual Theme (slate, violet, emerald, sunset, midnight, glass)
   - Whenever proposing or adjusting the architecture, generate a "suggestions" array with 2-4 key blocks, explaining WHY each block is ideal for their niche (e.g. "Para consultoria, a prova social de clientes aumenta a confiança em 300% e o botão de WhatsApp acelera o fechamento de propostas").

2. PROGRESSIVE CONVERSATIONAL FORM FLOW (DATA COLLECTION):
   - Assess what key data is still missing from the user's profile to complete their high-converting setup:
     * WhatsApp number or custom welcome text
     * Lead magnet offer / headline
     * Main portfolio or sales link
     * Featured video link (if applicable)
     * Brand tone or visual theme
   - In the "reply" field: Keep your message conversational, direct, and encouraging. Ask ONLY 1 or 2 clear, sequential questions to collect the missing info, acting like a friendly interactive form in the chat.
   - Provide 2-4 "quickReplies" (short 2-5 word button options) that the user can click to answer instantly or guide the conversation.

3. REAL STRUCTURAL PROFILE CHANGES:
   - When the user answers your questions or asks for changes, synthesize the data and return structural updates.
   - You can update multiple profile properties simultaneously!

JSON OUTPUT FORMAT SPECIFICATION (Strict JSON only, no markdown formatting outside JSON):
{
  "reply": (string) Conversational reply in the user's language (Portuguese or English matching user), asking the next progressive question or explaining what was built,
  "stage": "architecture_proposal" | "collecting_info" | "structure_applied" | "refinement",
  "nextMissingField": "niche" | "whatsapp" | "leadMagnet" | "portfolioLink" | "video" | "theme" | "completed",
  "suggestions": [
    {
      "blockType": "leadForm" | "testimonials" | "featuredVideo" | "whatsapp" | "tipJar" | "gallery" | "highlightedLink" | "theme",
      "title": "Title of the suggested block",
      "reason": "Why this block is ideal for the user's specific niche",
      "recommendedAction": "Action description",
      "status": "recommended" | "applied"
    }
  ],
  "quickReplies": ["Short suggestion 1", "Short suggestion 2", "Short suggestion 3"],
  "updatedBio": (string, optional) Refined, punchy bio text,
  "updatedDisplayName": (string, optional) Name or brand title,
  "updatedLeadHeadline": (string, optional) Headline for email lead capture widget,
  "updatedLeadButtonText": (string, optional) Button text for lead widget,
  "updatedWhatsappNumber": (string, optional) Clean international phone number,
  "updatedWhatsappWelcomeMessage": (string, optional) High-converting pre-filled WhatsApp greeting,
  "enableWhatsappButton": (boolean, optional) Set true/false to enable/disable floating WhatsApp,
  "enableTipJar": (boolean, optional) Set true/false,
  "tipJarHeadline": (string, optional),
  "featuredVideoUrl": (string, optional) YouTube / Reel URL,
  "updatedTheme": "slate" | "violet" | "emerald" | "sunset" | "midnight" | "glass" (optional),
  "updatedButtonStyle": "filled" | "outline" | "glass" | "shadow" (optional),
  "newLinks": [
    { "title": "Link label", "url": "https://...", "isHighlighted": true }
  ],
  "newTestimonials": [
    { "clientName": "Name", "clientRole": "Role", "rating": 5, "comment": "Feedback text" }
  ],
  "newGalleryPhotos": [
    { "title": "Product/Service title", "imageUrl": "https://...", "priceCaption": "$...", "linkUrl": "https://..." }
  ]
}

SAFETY & SCOPE ENFORCEMENT:
- Never generate code, scripts, HTML <script> tags, or system commands.
- Respond in the same language the user uses (default to Portuguese if input is Portuguese, English if English).`;

    const userPromptPayload = `
Authenticated User ID: ${userId}
Current Profile State:
${JSON.stringify({
  profile: currentProfile,
  linksCount: currentLinks?.length || 0,
  hasLeadForm: !!currentProfile?.leadFormHeadline,
  hasWhatsApp: !!currentProfile?.enableWhatsappButton,
  hasVideo: !!currentProfile?.featuredVideoUrl,
  hasGallery: !!currentProfile?.galleryPhotos?.length,
  hasTestimonials: !!currentTestimonials?.length,
}, null, 2)}
Recent Chat Context:
${Array.isArray(chatHistory) ? JSON.stringify(chatHistory.slice(-6)) : '[]'}
User Message: "${message}"
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: userPromptPayload,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
      },
    });

    const text = response.text || '{}';
    let result = {};
    try {
      result = JSON.parse(text);
    } catch {
      result = {
        reply: 'Entendido! Analisei o seu perfil e atualizei a estrutura com foco em conversão.',
        stage: 'refinement',
      };
    }

    res.json({ success: true, result });
  } catch (error: any) {
    console.error('Gemini Chat Refine Error:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to refine chat' });
  }
});

// Single Copy Generation Route
app.post('/api/ai/generate', async (req, res) => {
  try {
    const { prompt, type, niche } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    let systemInstruction = 'You are an expert SaaS copywriter specializing in high-converting link-in-bio bios, titles, SEO meta tags, and social proof calls to action.';

    if (type === 'bio') {
      systemInstruction += ' Write a compelling, high-converting bio paragraph under 160 characters. Return 3 distinct variations as JSON array.';
    } else if (type === 'cta') {
      systemInstruction += ' Write catchy, urgent, high-CTR button titles for a bio page. Return 4 catchy button labels under 35 characters as JSON array.';
    } else if (type === 'testimonial') {
      systemInstruction += ' Write realistic client reviews with star ratings and positive testimonials for small businesses and creators. Return as JSON array of objects with keys: name, role, rating (5), comment.';
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `Context / Business Niche: ${niche || 'General Digital Business'}\nUser prompt: ${prompt}`,
      config: {
        systemInstruction,
      },
    });

    const text = response.text || '';
    res.json({ success: true, text });
  } catch (error: any) {
    console.error('Gemini API Server Error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate content with Gemini AI',
    });
  }
});

// Password hashing helper for server-side auth
function hashPasswordWithSalt(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
}

// ==========================================
// AUTHENTICATION API ENDPOINTS (FALLBACK & SECURE EMAIL LOGIN/SIGNUP)
// ==========================================

// 1. Email Sign Up Endpoint
app.post('/api/auth/signup', (req, res) => {
  try {
    const { name, email, password, username } = req.body;

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return res.status(400).json({ success: false, message: 'Endereço de email válido é obrigatório.' });
    }
    if (!password || typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({ success: false, message: 'A senha deve conter pelo menos 6 caracteres.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = (name && typeof name === 'string' ? name.trim() : '') || cleanEmail.split('@')[0];
    const cleanUsername = (username && typeof username === 'string'
      ? username.trim().toLowerCase().replace(/[^a-z0-9_]/g, '')
      : '') || cleanEmail.split('@')[0].replace(/[^a-z0-9_]/g, '');

    const users = loadServerUsers();
    const existingUser = users.find((u) => u.email === cleanEmail);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Este endereço de email já está cadastrado. Por favor, faça login ou use outro email.',
      });
    }

    const userId = `usr_${crypto.randomBytes(12).toString('hex')}`;
    const salt = crypto.randomBytes(16).toString('hex');
    const passwordHash = `${salt}:${hashPasswordWithSalt(password, salt)}`;

    const newUser: StoredUser = {
      id: userId,
      name: cleanName,
      email: cleanEmail,
      username: cleanUsername,
      isPro: false,
      passwordHash,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    users.push(newUser);
    saveServerUsers(users);

    const safeAccount = {
      id: userId,
      name: cleanName,
      email: cleanEmail,
      username: cleanUsername,
      isPro: false,
      createdAt: newUser.createdAt,
    };

    console.log(`[Auth Signup] User registered successfully: @${cleanUsername} (${cleanEmail})`);
    return res.json({
      success: true,
      user: safeAccount,
      username: cleanUsername,
      message: `Conta @${cleanUsername} criada com sucesso!`,
    });
  } catch (error: any) {
    console.error('[Auth Signup Error]', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno ao processar o cadastro. Tente novamente mais tarde.',
    });
  }
});

// 2. Email Login Endpoint
app.post('/api/auth/login', (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email e senha são obrigatórios.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const users = loadServerUsers();
    const userDoc = users.find((u) => u.email === cleanEmail);

    if (!userDoc) {
      return res.status(404).json({
        success: false,
        message: 'Nenhuma conta encontrada com este email. Verifique o endereço digitado ou cadastre-se.',
      });
    }

    if (userDoc.passwordHash) {
      const [salt, storedHash] = userDoc.passwordHash.split(':');
      const computedHash = hashPasswordWithSalt(password, salt);
      if (computedHash !== storedHash) {
        return res.status(401).json({
          success: false,
          message: 'Senha incorreta. Por favor, verifique sua senha e tente novamente.',
        });
      }
    }

    const safeAccount = {
      id: userDoc.id,
      name: userDoc.name,
      email: userDoc.email,
      username: userDoc.username,
      isPro: !!userDoc.isPro,
      createdAt: userDoc.createdAt,
    };

    console.log(`[Auth Login] User logged in: @${safeAccount.username} (${safeAccount.email})`);
    return res.json({
      success: true,
      user: safeAccount,
      message: `Bem-vindo de volta, ${safeAccount.name}!`,
    });
  } catch (error: any) {
    console.error('[Auth Login Error]', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno ao autenticar usuário. Tente novamente mais tarde.',
    });
  }
});

// Lead capture endpoint
app.post('/api/leads/subscribe', (req, res) => {
  const { email, name, profileUsername } = req.body;
  if (!email || !email.includes('@')) {
    return res.status(400).json({ success: false, message: 'Valid email is required' });
  }
  
  console.log(`[Lead Captured] ${email} for profile @${profileUsername || 'default'}`);
  res.json({
    success: true,
    message: 'Lead captured successfully!',
    lead: {
      id: `lead_${Date.now()}`,
      email,
      name: name || 'Subscriber',
      createdAt: new Date().toISOString(),
    },
  });
});

// Tip Jar donation endpoint via Trywalled Wallet
app.post('/api/tips/process', (req, res) => {
  const { amount, currency, name, message, username, gateway } = req.body;
  console.log(`[Tip Processed via ${gateway || 'Trywalled Wallet'}] ${amount} ${currency || 'MZN'} from ${name || 'Anonymous'} to @${username}`);
  
  res.json({
    success: true,
    transactionId: `trywalled_tx_${Date.now()}`,
    amount,
    currency: currency || 'MZN',
    gateway: gateway || 'Trywalled Wallet',
    timestamp: new Date().toISOString(),
  });
});

// Analytics tracking endpoint
app.post('/api/analytics/track', (req, res) => {
  const { linkId, username, eventType } = req.body;
  console.log(`[Analytics Event] ${eventType || 'click'} on link ${linkId} for @${username}`);
  res.json({ success: true, trackedAt: new Date().toISOString() });
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 OmniLink Server running at http://localhost:${PORT}`);
  });
}

startServer();
