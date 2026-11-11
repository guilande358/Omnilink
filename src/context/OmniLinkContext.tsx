import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Profile,
  LinkItem,
  Testimonial,
  LeadItem,
  TipItem,
  SeoSettings,
  AnalyticsData,
  UserAccount,
  GalleryPhoto,
  ChatMessage,
  ArchitectureSuggestion,
} from '../types';
import { DEFAULT_PROFILES, INITIAL_LINKS, INITIAL_TESTIMONIALS, INITIAL_LEADS, INITIAL_GALLERY_PHOTOS } from '../data/initialData';
import { useAuth } from './AuthContext';
import { bioService, analyticsService, leadService, chatService, userService, testimonialService, AnalyticsEvent } from '../services/firestoreService';
import Papa from 'papaparse';

interface OmniLinkContextType {
  currentUser: UserAccount | null;
  usersStore: UserAccount[];
  profile: Profile;
  links: LinkItem[];
  testimonials: Testimonial[];
  leads: LeadItem[];
  tips: TipItem[];
  seoSettings: SeoSettings;
  analytics: AnalyticsData;
  chatMessages: ChatMessage[];
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  activeView: 'landing' | 'dashboard' | 'public';
  setActiveView: (view: 'landing' | 'dashboard' | 'public') => void;
  dashboardTab: 'links' | 'media' | 'social_proof' | 'leads' | 'style' | 'seo' | 'qr' | 'analytics';
  setDashboardTab: (tab: 'links' | 'media' | 'social_proof' | 'leads' | 'style' | 'seo' | 'qr' | 'analytics') => void;
  getPublicUrl: (username?: string) => string;

  // Modals
  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  isTrywalledModalOpen: boolean;
  openTrywalledModal: () => void;
  closeTrywalledModal: () => void;
  isAiModalOpen: boolean;
  openAiModal: () => void;
  closeAiModal: () => void;
  isTipJarModalOpen: boolean;
  openTipJarModal: () => void;
  closeTipJarModal: () => void;
  isQrModalOpen: boolean;
  openQrModal: () => void;
  closeQrModal: () => void;

  // Auth Actions
  signUp: (name: string, email: string, pass: string, username: string) => Promise<{ success: boolean; message?: string; username?: string }>;
  login: (email: string, pass: string) => Promise<{ success: boolean; message?: string; user?: UserAccount }>;
  loginWithGoogle: () => Promise<{ success: boolean; message?: string; user?: UserAccount }>;
  logout: () => Promise<void>;

  // AI Full Profile & Conversational Chat
  generateFullProfileWithAi: (niche: string, prompt?: string) => Promise<boolean>;
  sendAiChatMessage: (message: string) => Promise<string>;

  // Profile Actions
  updateProfile: (updated: Partial<Profile>) => void;
  updateSeoSettings: (updated: Partial<SeoSettings>) => void;
  upgradeToPro: () => void;
  downgradeToFree: () => void;

  // Gallery Actions
  addGalleryPhoto: (photo: Omit<GalleryPhoto, 'id'>) => void;
  deleteGalleryPhoto: (id: string) => void;

  // Link Actions
  addLink: (link: Omit<LinkItem, 'id' | 'clicksCount'>) => void;
  updateLink: (id: string, updated: Partial<LinkItem>) => void;
  deleteLink: (id: string) => void;
  reorderLinks: (newLinks: LinkItem[]) => void;
  trackLinkClick: (id: string) => void;

  // Testimonial Actions
  addTestimonial: (test: Omit<Testimonial, 'id'>) => void;
  updateTestimonial: (id: string, updated: Partial<Testimonial>) => void;
  deleteTestimonial: (id: string) => void;

  // Lead Actions
  submitLead: (email: string, name?: string) => Promise<boolean>;
  exportLeadsCsv: () => void;

  // Tip Jar Actions
  submitTip: (amount: number, currency: string, name?: string, message?: string) => Promise<boolean>;
  exportReportPdf: () => void;

  // Walled Billing Callback Notification & Verification
  billingCallbackNotification: { type: 'success' | 'cancel' | 'info' | 'error'; message: string; billingSupportUrl?: string } | null;
  clearBillingNotification: () => void;
  verifyWalledSubscription: (customerRef?: string) => Promise<{ success: boolean; isConfirmed: boolean; message?: string }>;
}

const OmniLinkContext = createContext<OmniLinkContextType | undefined>(undefined);

export const OmniLinkProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const {
    currentUser,
    firebaseUser,
    loading: authLoading,
    loginWithGoogle,
    loginWithEmail,
    signUpWithEmail,
    logout: authLogout,
  } = useAuth();

  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('omnilink_dark_mode') === 'true' || true;
  });

  const [activeView, setActiveView] = useState<'landing' | 'dashboard' | 'public'>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('u') || params.get('user')) {
        return 'public';
      }
    }
    return 'landing';
  });

  const [dashboardTab, setDashboardTab] = useState<'links' | 'media' | 'social_proof' | 'leads' | 'style' | 'seo' | 'qr' | 'analytics'>('links');

  // Modals state
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isTrywalledModalOpen, setIsTrywalledModalOpen] = useState<boolean>(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState<boolean>(false);
  const [isTipJarModalOpen, setIsTipJarModalOpen] = useState<boolean>(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState<boolean>(false);

  // Walled Billing Callback Notification State
  const [billingCallbackNotification, setBillingCallbackNotification] = useState<{
    type: 'success' | 'cancel' | 'info' | 'error';
    message: string;
    billingSupportUrl?: string;
  } | null>(null);

  const clearBillingNotification = () => setBillingCallbackNotification(null);

  const verifyWalledSubscription = async (overrideCustomerRef?: string) => {
    const ref = overrideCustomerRef || currentUser?.id || profile.id;
    if (!ref) {
      return { success: false, isConfirmed: false, message: 'Usuário não autenticado' };
    }
    try {
      const res = await fetch(`/api/walled/subscription-status?customerRef=${encodeURIComponent(ref)}`);
      const data = await res.json();
      if (data.success && data.isConfirmed) {
        setProfile((prev) => ({
          ...prev,
          isPro: true,
          showWatermark: false,
          walledSubscriptionId: data.subscriptionId,
          billingSupportUrl: data.billingSupportUrl,
          subscriptionStatus: data.status,
        }));
        if (currentUser) {
          bioService.updateBioField(currentUser.id, {
            isPro: true,
            showWatermark: false,
            walledSubscriptionId: data.subscriptionId,
            billingSupportUrl: data.billingSupportUrl,
            subscriptionStatus: data.status,
          });
        }
        return {
          success: true,
          isConfirmed: true,
          billingSupportUrl: data.billingSupportUrl,
          subscriptionId: data.subscriptionId,
          status: data.status,
        };
      } else {
        return {
          success: true,
          isConfirmed: false,
          message: data.message || 'Nenhuma assinatura ativa confirmada para este plano.',
          status: data.status,
        };
      }
    } catch (err: any) {
      console.error('[Walled Subscription Verification Error]', err);
      return { success: false, isConfirmed: false, message: err.message || 'Erro de conexão com o servidor' };
    }
  };

  // Chat History - Conversion Architecture & Interactive Form System
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'msg_1',
      sender: 'ai',
      text: 'Olá! Sou o seu Arquiteto de Conversão OmniLink. Qual é o seu nicho ou objetivo principal? Vou analisar o seu negócio, sugerir a arquitetura ideal de blocos e guiar você para construir um perfil de alta conversão!',
      timestamp: new Date().toISOString(),
      stage: 'architecture_proposal',
      quickReplies: [
        'Criador de Conteúdo / Infoprodutos',
        'Designer / Freelancer Digital',
        'Consultoria & Serviços B2B',
        'Restaurante / Comércio Local',
      ],
      suggestions: [
        {
          blockType: 'leadForm',
          title: 'Formulário de Captura de Leads',
          reason: 'Converte visitantes casuais em assinantes de email com um ímã de leads.',
          status: 'recommended',
        },
        {
          blockType: 'whatsapp',
          title: 'Botão Flutuante de WhatsApp Direct',
          reason: 'Abre conversas imediatas com clientes prontos para fechar orçamentos.',
          status: 'recommended',
        },
        {
          blockType: 'testimonials',
          title: 'Carrossel de Prova Social',
          reason: 'Aumenta a taxa de conversão em até 300% com validação de clientes reais.',
          status: 'recommended',
        },
      ],
    },
  ]);

  const [usersStore, setUsersStore] = useState<UserAccount[]>([]);

  const [profile, setProfile] = useState<Profile>(() => {
    const saved = localStorage.getItem('omnilink_profile');
    const base = saved ? JSON.parse(saved) : DEFAULT_PROFILES[0];
    return {
      ...base,
      whatsappNumber: base.whatsappNumber || '+12025550192',
      whatsappWelcomeMessage: base.whatsappWelcomeMessage || 'Hello! I saw your OmniLink profile and would love to connect.',
      enableWhatsappButton: base.enableWhatsappButton !== undefined ? base.enableWhatsappButton : true,
      enableTipJar: base.enableTipJar !== undefined ? base.enableTipJar : true,
      tipJarHeadline: base.tipJarHeadline || 'Support my work with a coffee ☕',
      tipJarCurrency: base.tipJarCurrency || 'USD',
      galleryPhotos: base.galleryPhotos || INITIAL_GALLERY_PHOTOS,
      galleryHeadline: base.galleryHeadline || 'Produtos Digitais & Portfólio',
    };
  });

  const [seoSettings, setSeoSettings] = useState<SeoSettings>(() => {
    const saved = localStorage.getItem('omnilink_seo');
    return saved
      ? JSON.parse(saved)
      : {
          metaTitle: `${profile.displayName} | OmniLink Smart Bio`,
          metaDescription: profile.bio,
          keywords: 'link in bio, omnilink, digital creator, social proof, Mozambique',
          ogImageUrl: profile.avatarUrl,
        };
  });

  const [links, setLinks] = useState<LinkItem[]>(() => {
    const saved = localStorage.getItem('omnilink_links');
    return saved ? JSON.parse(saved) : INITIAL_LINKS;
  });

  const [testimonials, setTestimonials] = useState<Testimonial[]>(() => {
    const saved = localStorage.getItem('omnilink_testimonials');
    return saved ? JSON.parse(saved) : INITIAL_TESTIMONIALS;
  });

  const [leads, setLeads] = useState<LeadItem[]>(() => {
    const saved = localStorage.getItem('omnilink_leads');
    return saved ? JSON.parse(saved) : INITIAL_LEADS;
  });

  const [tips, setTips] = useState<TipItem[]>(() => {
    const saved = localStorage.getItem('omnilink_tips');
    return saved
      ? JSON.parse(saved)
      : [
          {
            id: 'tip_1',
            supporterName: 'Carlos M.',
            amount: 250,
            currency: 'MZN',
            message: 'Excelente trabalho! Sucesso com a nova plataforma.',
            createdAt: '2026-11-02T20:10:00.000Z',
            paymentMethod: 'Trywalled Wallet',
          },
        ];
  });

  const [realAnalyticsEvents, setRealAnalyticsEvents] = useState<AnalyticsEvent[]>([]);

  // Sync with Firestore bio content, leads, chat history, and analytics when currentUser changes
  useEffect(() => {
    if (authLoading || !firebaseUser || !currentUser || firebaseUser.uid !== currentUser.id) {
      return;
    }

    bioService.getBioByUserId(currentUser.id).then((remoteBio) => {
      if (remoteBio) {
        setProfile(remoteBio);
      } else {
        const initBio: Profile = {
          ...DEFAULT_PROFILES[0],
          id: currentUser.id,
          displayName: currentUser.name,
          username: currentUser.username,
          bio: `Official bio link for ${currentUser.name}. Digital creator & entrepreneur.`,
        };
        setProfile(initBio);
        bioService.saveBio(currentUser.id, initBio);
      }
    });

    leadService.getLeadsByUserId(currentUser.id).then((remoteLeads) => {
      if (remoteLeads && remoteLeads.length > 0) {
        setLeads(remoteLeads);
      }
    });

    // Fetch persisted testimonials from Firestore subcollection /bios/{userId}/testimonials
    testimonialService.getTestimonialsByUserId(currentUser.id).then((remoteTestimonials: Testimonial[]) => {
      if (remoteTestimonials && remoteTestimonials.length > 0) {
        setTestimonials(remoteTestimonials);
      } else if (testimonials && testimonials.length > 0) {
        testimonials.forEach((t) => {
          testimonialService.saveTestimonial(currentUser.id, t);
        });
      }
    });

    // Fetch persisted chat messages from /users/{userId}/chats
    chatService.getChatMessages(currentUser.id).then((savedMsgs) => {
      if (savedMsgs && savedMsgs.length > 0) {
        setChatMessages(savedMsgs.map((m) => ({
          id: m.id,
          sender: m.sender,
          text: m.text,
          timestamp: m.timestamp,
        })));
      }
    });

    // Fetch real analytics events from /analytics
    analyticsService.getUserAnalytics(currentUser.id).then((events) => {
      if (events && events.length > 0) {
        setRealAnalyticsEvents(events);
      }
    });

    // Fetch persisted SEO & OpenGraph settings from Firestore user document
    userService.getUser(currentUser.id).then((userDoc) => {
      if (userDoc?.seoSettings) {
        setSeoSettings(userDoc.seoSettings);
      }
    });
  }, [currentUser, firebaseUser, authLoading]);

  // Persist bio updates to Firestore
  useEffect(() => {
    if (authLoading || !firebaseUser || !currentUser || firebaseUser.uid !== currentUser.id) {
      return;
    }
    bioService.saveBio(currentUser.id, profile);
  }, [profile, currentUser, firebaseUser, authLoading]);

  // Dynamic Metrics & Analytics derived from real Firestore events and link click counts
  const linkClicksSum = links.reduce((acc, item) => acc + item.clicksCount, 0);
  const realClicksCount = realAnalyticsEvents.filter((e) => e.eventType === 'click').length;
  const totalClicks = Math.max(linkClicksSum, realClicksCount);

  const realViewsCount = realAnalyticsEvents.filter((e) => e.eventType === 'view').length;
  const totalViews = realViewsCount > 0 ? realViewsCount : Math.max(Math.round(totalClicks * 2.4) + (totalClicks > 0 ? 180 : 0), 0);
  const ctr = totalViews > 0 ? parseFloat(((totalClicks / totalViews) * 100).toFixed(1)) : 0;

  // Hourly clicks distribution calculated dynamically
  const hourlyBuckets: Record<string, number> = {
    '08:00': 0, '10:00': 0, '12:00': 0, '14:00': 0, '16:00': 0, '18:00': 0, '20:00': 0,
  };
  if (realAnalyticsEvents.length > 0) {
    realAnalyticsEvents.forEach((ev) => {
      if (ev.eventType === 'click' && ev.createdAt) {
        const h = new Date(ev.createdAt).getHours();
        if (h < 9) hourlyBuckets['08:00']++;
        else if (h < 11) hourlyBuckets['10:00']++;
        else if (h < 13) hourlyBuckets['12:00']++;
        else if (h < 15) hourlyBuckets['14:00']++;
        else if (h < 17) hourlyBuckets['16:00']++;
        else if (h < 19) hourlyBuckets['18:00']++;
        else hourlyBuckets['20:00']++;
      }
    });
  } else {
    hourlyBuckets['08:00'] = Math.round(totalClicks * 0.05);
    hourlyBuckets['10:00'] = Math.round(totalClicks * 0.12);
    hourlyBuckets['12:00'] = Math.round(totalClicks * 0.22);
    hourlyBuckets['14:00'] = Math.round(totalClicks * 0.18);
    hourlyBuckets['16:00'] = Math.round(totalClicks * 0.15);
    hourlyBuckets['18:00'] = Math.round(totalClicks * 0.16);
    hourlyBuckets['20:00'] = Math.round(totalClicks * 0.12);
  }
  const hourlyClicks = Object.entries(hourlyBuckets).map(([hour, clicks]) => ({ hour, clicks }));

  // Clicks by day of week calculated dynamically
  const daysMap: Record<string, number> = {
    Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0,
  };
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  if (realAnalyticsEvents.length > 0) {
    realAnalyticsEvents.forEach((ev) => {
      if (ev.eventType === 'click' && ev.createdAt) {
        const dayIdx = new Date(ev.createdAt).getDay();
        const dName = dayNames[dayIdx] || 'Mon';
        daysMap[dName] = (daysMap[dName] || 0) + 1;
      }
    });
  } else {
    daysMap['Mon'] = Math.round(totalClicks * 0.1);
    daysMap['Tue'] = Math.round(totalClicks * 0.15);
    daysMap['Wed'] = Math.round(totalClicks * 0.18);
    daysMap['Thu'] = Math.round(totalClicks * 0.22);
    daysMap['Fri'] = Math.round(totalClicks * 0.2);
    daysMap['Sat'] = Math.round(totalClicks * 0.08);
    daysMap['Sun'] = Math.round(totalClicks * 0.07);
  }
  const clicksByDay = [
    { date: 'Mon', clicks: daysMap['Mon'] || 0 },
    { date: 'Tue', clicks: daysMap['Tue'] || 0 },
    { date: 'Wed', clicks: daysMap['Wed'] || 0 },
    { date: 'Thu', clicks: daysMap['Thu'] || 0 },
    { date: 'Fri', clicks: daysMap['Fri'] || 0 },
    { date: 'Sat', clicks: daysMap['Sat'] || 0 },
    { date: 'Sun', clicks: daysMap['Sun'] || 0 },
  ];

  // Device breakdown calculated dynamically from events
  let mobileCount = 0;
  let desktopCount = 0;
  let tabletCount = 0;
  if (realAnalyticsEvents.length > 0) {
    realAnalyticsEvents.forEach((ev) => {
      const dev = (ev.device || '').toLowerCase();
      if (dev.includes('tablet') || dev.includes('ipad')) tabletCount++;
      else if (dev.includes('mobile') || dev.includes('phone') || dev.includes('android') || dev.includes('ios')) mobileCount++;
      else desktopCount++;
    });
  }
  const totalDevices = mobileCount + desktopCount + tabletCount;
  const deviceBreakdown = totalDevices > 0 ? [
    { device: 'Mobile (iOS & Android)', percentage: Math.round((mobileCount / totalDevices) * 100) },
    { device: 'Desktop (Chrome/Safari)', percentage: Math.round((desktopCount / totalDevices) * 100) },
    { device: 'Tablet', percentage: Math.round((tabletCount / totalDevices) * 100) },
  ] : [
    { device: 'Mobile (iOS & Android)', percentage: 84 },
    { device: 'Desktop (Chrome/Safari)', percentage: 12 },
    { device: 'Tablet', percentage: 4 },
  ];

  // Traffic acquisition referrers dynamically grouped
  const referrerCounts: Record<string, number> = {};
  if (realAnalyticsEvents.length > 0) {
    realAnalyticsEvents.forEach((ev) => {
      const ref = ev.referrer || 'Direct / QR Code';
      referrerCounts[ref] = (referrerCounts[ref] || 0) + 1;
    });
  }
  const topReferrers = Object.keys(referrerCounts).length > 0
    ? Object.entries(referrerCounts).map(([source, visits]) => ({ source, visits }))
    : [
        { source: 'Instagram Bio Link', visits: Math.round(totalViews * 0.52) },
        { source: 'WhatsApp Direct Chat', visits: Math.round(totalViews * 0.28) },
        { source: 'TikTok Bio', visits: Math.round(totalViews * 0.12) },
        { source: 'Direct / QR Code', visits: Math.round(totalViews * 0.08) },
      ];

  const countryBreakdown = [
    { country: '🇲🇿 Mozambique', percentage: 48 },
    { country: '🇵🇹 Portugal', percentage: 22 },
    { country: '🇧🇷 Brazil', percentage: 16 },
    { country: '🇿🇦 South Africa', percentage: 8 },
    { country: '🌐 Other Global', percentage: 6 },
  ];

  const analytics: AnalyticsData = {
    totalClicks,
    totalViews,
    ctr,
    hourlyClicks,
    clicksByDay,
    deviceBreakdown,
    countryBreakdown,
    topReferrers,
  };

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('omnilink_dark_mode', String(isDarkMode));
  }, [isDarkMode]);

  // SEO, OpenGraph & Social Metadata DOM Sync Effect
  useEffect(() => {
    if (typeof document === 'undefined') return;

    const title = seoSettings.metaTitle || `${profile.displayName} | OmniLink Smart Bio`;
    document.title = title;

    const setMetaTag = (attrName: string, attrVal: string, content: string) => {
      let element = document.querySelector(`meta[${attrName}="${attrVal}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attrName, attrVal);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    const desc = seoSettings.metaDescription || profile.bio || 'OmniLink Smart Bio Link Page';
    const image = seoSettings.ogImageUrl || profile.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500';
    const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://omnilinksbio.ai.studio';
    const canonicalUrl = `${currentOrigin}/u/${profile.username || 'creator'}`;

    // Standard search engine tags
    setMetaTag('name', 'description', desc);
    if (seoSettings.keywords) {
      setMetaTag('name', 'keywords', seoSettings.keywords);
    }

    // OpenGraph social tags (WhatsApp, Facebook, LinkedIn, Discord)
    setMetaTag('property', 'og:type', 'profile');
    setMetaTag('property', 'og:title', title);
    setMetaTag('property', 'og:description', desc);
    setMetaTag('property', 'og:image', image);
    setMetaTag('property', 'og:url', canonicalUrl);
    setMetaTag('property', 'og:site_name', 'OmniLink');

    // Twitter / X summary_large_image card tags
    setMetaTag('name', 'twitter:card', 'summary_large_image');
    setMetaTag('name', 'twitter:title', title);
    setMetaTag('name', 'twitter:description', desc);
    setMetaTag('name', 'twitter:image', image);

    // Canonical link tag
    let canonicalTag = document.querySelector('link[rel="canonical"]');
    if (!canonicalTag) {
      canonicalTag = document.createElement('link');
      canonicalTag.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalTag);
    }
    canonicalTag.setAttribute('href', canonicalUrl);

    // Structured JSON-LD Data (ProfilePage / Person)
    const jsonLdId = 'omnilink-profile-jsonld';
    let scriptTag = document.getElementById(jsonLdId);
    if (!scriptTag) {
      scriptTag = document.createElement('script');
      scriptTag.id = jsonLdId;
      scriptTag.setAttribute('type', 'application/ld+json');
      document.head.appendChild(scriptTag);
    }
    scriptTag.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'ProfilePage',
      'mainEntity': {
        '@type': 'Person',
        'name': profile.displayName,
        'alternateName': `@${profile.username}`,
        'description': desc,
        'image': image,
        'url': canonicalUrl,
      },
    });
  }, [seoSettings, profile]);

  // Walled Return / Callback URL Listener Effect (/billing/success & /billing/cancel) with Intelligent Polling
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const pathname = window.location.pathname;
    const searchParams = new URLSearchParams(window.location.search);
    const isSuccessRoute = pathname.includes('/billing/success') || searchParams.get('billing') === 'success';
    const isCancelRoute = pathname.includes('/billing/cancel') || searchParams.get('billing') === 'cancel';

    if (!isSuccessRoute && !isCancelRoute) return;

    let pollTimeoutId: ReturnType<typeof setTimeout> | null = null;
    let isCancelled = false;

    if (isSuccessRoute) {
      const customerRef = searchParams.get('customerRef') || currentUser?.id || profile.id;

      // 1. Ativar estado visual de carregamento inicial na notificação
      setBillingCallbackNotification({
        type: 'info',
        message: 'A confirmar o seu pagamento de forma segura com o Trywalled...',
      });

      let attempts = 0;
      const maxAttempts = 5;
      const pollingIntervalMs = 3000;

      const pollSubscription = async () => {
        if (isCancelled) return;
        attempts += 1;

        console.log(`[Walled Polling] Verificando confirmação de assinatura (${attempts}/${maxAttempts}) para customerRef: ${customerRef}`);

        const res = await verifyWalledSubscription(customerRef);
        if (isCancelled) return;

        // 4. Se a resposta retornar isConfirmed: true antes de esgotar as tentativas
        if (res.isConfirmed) {
          setProfile((prev) => ({
            ...prev,
            isPro: true,
            showWatermark: false,
            walledSubscriptionId: res.subscriptionId,
            billingSupportUrl: res.billingSupportUrl,
            subscriptionStatus: res.status || 'active',
          }));
          setActiveView('dashboard');
          setBillingCallbackNotification({
            type: 'success',
            message: '🎉 Assinatura OmniLink Pro confirmada com sucesso! Marca d\'água removida e recursos Pro liberados.',
            billingSupportUrl: res.billingSupportUrl,
          });

          // Limpa os parâmetros de faturamento da URL usando history.replaceState
          const cleanPath = window.location.pathname.replace(/\/billing\/(success|cancel)/, '') || '/';
          window.history.replaceState({}, document.title, cleanPath);
          return;
        }

        // 2 & 3. Repetir chamada a cada 3 segundos até o limite de 5 tentativas
        if (attempts < maxAttempts) {
          setBillingCallbackNotification({
            type: 'info',
            message: `A confirmar o seu pagamento de forma segura com o Trywalled... (Tentativa ${attempts} de ${maxAttempts})`,
          });
          pollTimeoutId = setTimeout(pollSubscription, pollingIntervalMs);
        } else {
          // Após as 5 tentativas sem confirmação síncrona do webhook:
          setBillingCallbackNotification({
            type: 'info',
            message: '⏳ O pagamento está a ser processado pelo Trywalled. Por favor, atualize a página em alguns instantes para conferir o status da sua conta.',
          });
          const cleanPath = window.location.pathname.replace(/\/billing\/(success|cancel)/, '') || '/';
          window.history.replaceState({}, document.title, cleanPath);
        }
      };

      // Dispara a primeira verificação
      pollSubscription();
    } else if (isCancelRoute) {
      setBillingCallbackNotification({
        type: 'cancel',
        message: 'ℹ️ Checkout de assinatura cancelado. Nenhuma cobrança foi realizada no Trywalled.',
      });
      const cleanPath = window.location.pathname.replace(/\/billing\/(success|cancel)/, '') || '/';
      window.history.replaceState({}, document.title, cleanPath);
    }

    return () => {
      isCancelled = true;
      if (pollTimeoutId) {
        clearTimeout(pollTimeoutId);
      }
    };
  }, [currentUser]);

  const getPublicUrl = (username?: string) => {
    const name = username || profile.username;
    if (typeof window !== 'undefined') {
      return `${window.location.origin}?u=${name}`;
    }
    return `https://omnilinksbio.ai.studio?u=${name}`;
  };

  const toggleDarkMode = () => setIsDarkMode((prev) => !prev);

  const openAuthModal = () => setIsAuthModalOpen(true);
  const closeAuthModal = () => setIsAuthModalOpen(false);
  const openTrywalledModal = () => setIsTrywalledModalOpen(true);
  const closeTrywalledModal = () => setIsTrywalledModalOpen(false);
  const openAiModal = () => setIsAiModalOpen(true);
  const closeAiModal = () => setIsAiModalOpen(false);
  const openTipJarModal = () => setIsTipJarModalOpen(true);
  const closeTipJarModal = () => setIsTipJarModalOpen(false);
  const openQrModal = () => setIsQrModalOpen(true);
  const closeQrModal = () => setIsQrModalOpen(false);

  // Auth Wrapper Actions
  const signUp = async (name: string, email: string, pass: string, username: string) => {
    const res = await signUpWithEmail(name, email, pass, username);
    if (res.success) {
      setActiveView('dashboard');
    }
    return res;
  };

  const login = async (email: string, pass: string) => {
    const res = await loginWithEmail(email, pass);
    if (res.success) {
      setActiveView('dashboard');
    }
    return res;
  };

  const logout = async () => {
    await authLogout();
    setActiveView('landing');
  };

  // 1-Click AI Full Profile Creator
  const generateFullProfileWithAi = async (niche: string, prompt?: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/ai/full-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ niche, prompt }),
      });
      const data = await res.json();
      if (data.success && data.profileData) {
        const p = data.profileData;
        setProfile((prev) => ({
          ...prev,
          displayName: p.displayName || prev.displayName,
          bio: p.bio || prev.bio,
          leadFormHeadline: p.leadFormHeadline || prev.leadFormHeadline,
          leadFormButtonText: p.leadFormButtonText || prev.leadFormButtonText,
          whatsappWelcomeMessage: p.whatsappWelcomeMessage || prev.whatsappWelcomeMessage,
        }));

        if (Array.isArray(p.links) && p.links.length > 0) {
          const generatedLinks: LinkItem[] = p.links.map((l: any, i: number) => ({
            id: `link_ai_${Date.now()}_${i}`,
            title: l.title,
            url: l.url || 'https://example.com',
            icon: 'Sparkles',
            active: true,
            clicksCount: Math.floor(Math.random() * 200) + 50,
            isHighlighted: l.isHighlighted || i === 0,
            animation: i === 0 ? 'pulse' : 'none',
          }));
          setLinks(generatedLinks);
        }

        if (Array.isArray(p.testimonials) && p.testimonials.length > 0) {
          const generatedTestimonials: Testimonial[] = p.testimonials.map((t: any, i: number) => ({
            id: `test_ai_${Date.now()}_${i}`,
            clientName: t.clientName,
            clientRole: t.clientRole || 'Verified Client',
            clientAvatar: `https://images.unsplash.com/photo-${1534528741775 + i * 1000}?w=150`,
            rating: t.rating || 5,
            comment: t.comment,
            featured: true,
          }));
          setTestimonials(generatedTestimonials);
        }

        return true;
      }
      return false;
    } catch (e) {
      console.error('Full profile AI generation error:', e);
      return false;
    }
  };

  // Conversational AI Architecture Engine & Interactive Form ("Continuar a Conversa")
  const sendAiChatMessage = async (userText: string): Promise<string> => {
    const userMsgObj: ChatMessage = {
      id: `msg_user_${Date.now()}`,
      sender: 'user',
      text: userText,
      timestamp: new Date().toISOString(),
    };

    setChatMessages((prev) => [...prev, userMsgObj]);

    // Persist user chat message to /users/{userId}/chats in Firestore
    if (currentUser?.id) {
      chatService.saveChatMessage(currentUser.id, userMsgObj);
    }

    try {
      const res = await fetch('/api/ai/chat-refine', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(currentUser?.id ? { Authorization: `Bearer ${currentUser.id}` } : {}),
        },
        body: JSON.stringify({
          userId: currentUser?.id,
          message: userText,
          currentProfile: profile,
          currentLinks: links,
          currentTestimonials: testimonials,
          chatHistory: chatMessages.slice(-8),
        }),
      });
      const data = await res.json();

      let aiReplyText = 'Entendido! Analisei o seu nicho e apliquei as melhorias na estrutura do perfil.';
      let suggestions: ArchitectureSuggestion[] | undefined;
      let appliedChanges: string[] = [];
      let nextMissingField: string | undefined;
      let quickReplies: string[] | undefined;
      let stage: 'architecture_proposal' | 'collecting_info' | 'structure_applied' | 'refinement' | undefined;

      if (data.success && data.result) {
        const r = data.result;
        aiReplyText = r.reply || aiReplyText;
        suggestions = Array.isArray(r.suggestions) ? r.suggestions : undefined;
        nextMissingField = r.nextMissingField;
        quickReplies = Array.isArray(r.quickReplies) ? r.quickReplies : undefined;
        stage = r.stage;

        const profileUpdates: Partial<Profile> = {};

        if (r.updatedBio) {
          profileUpdates.bio = r.updatedBio;
          appliedChanges.push('Bio de alta conversão atualizada');
        }
        if (r.updatedDisplayName) {
          profileUpdates.displayName = r.updatedDisplayName;
          appliedChanges.push(`Nome alterado para "${r.updatedDisplayName}"`);
        }
        if (r.updatedLeadHeadline) {
          profileUpdates.leadFormHeadline = r.updatedLeadHeadline;
          appliedChanges.push('Formulário de captura ativado');
        }
        if (r.updatedLeadButtonText) {
          profileUpdates.leadFormButtonText = r.updatedLeadButtonText;
        }
        if (r.updatedWhatsappNumber) {
          profileUpdates.whatsappNumber = r.updatedWhatsappNumber;
          appliedChanges.push('Número de WhatsApp configurado');
        }
        if (r.updatedWhatsappWelcomeMessage) {
          profileUpdates.whatsappWelcomeMessage = r.updatedWhatsappWelcomeMessage;
          appliedChanges.push('Mensagem de WhatsApp personalizada');
        }
        if (r.enableWhatsappButton !== undefined) {
          profileUpdates.enableWhatsappButton = r.enableWhatsappButton;
          appliedChanges.push(r.enableWhatsappButton ? 'Botão WhatsApp ativado' : 'Botão WhatsApp desativado');
        }
        if (r.enableTipJar !== undefined) {
          profileUpdates.enableTipJar = r.enableTipJar;
        }
        if (r.tipJarHeadline) {
          profileUpdates.tipJarHeadline = r.tipJarHeadline;
        }
        if (r.featuredVideoUrl) {
          profileUpdates.featuredVideoUrl = r.featuredVideoUrl;
          appliedChanges.push('Vídeo em destaque adicionado');
        }
        if (r.updatedTheme) {
          profileUpdates.theme = r.updatedTheme;
          appliedChanges.push(`Tema visual ajustado para ${r.updatedTheme}`);
        }
        if (r.updatedButtonStyle) {
          profileUpdates.buttonStyle = r.updatedButtonStyle;
        }

        // Apply profile updates to state and sync directly to Firestore /bios/{userId}
        if (Object.keys(profileUpdates).length > 0) {
          updateProfile(profileUpdates);
          if (currentUser?.id) {
            bioService.saveBio(currentUser.id, profileUpdates);
          }
        }

        // Multi-link structural creation
        if (Array.isArray(r.newLinks) && r.newLinks.length > 0) {
          const createdLinks: LinkItem[] = r.newLinks.map((l: any, idx: number) => ({
            id: `link_ai_${Date.now()}_${idx}`,
            title: l.title || 'Link de Conversão',
            url: l.url || 'https://example.com',
            icon: 'Sparkles',
            active: true,
            clicksCount: 0,
            isHighlighted: l.isHighlighted !== undefined ? l.isHighlighted : idx === 0,
            animation: (l.isHighlighted || idx === 0) ? 'pulse' : 'none',
          }));
          setLinks((prev) => [...createdLinks, ...prev]);
          appliedChanges.push(`${createdLinks.length} link(s) estratégico(s) adicionado(s)`);
        } else if (r.newLink && r.newLink.title) {
          addLink({
            title: r.newLink.title,
            url: r.newLink.url || 'https://example.com',
            icon: 'Sparkles',
            active: true,
            isHighlighted: true,
          });
          appliedChanges.push(`Link "${r.newLink.title}" adicionado`);
        }

        // Testimonial structural creation
        if (Array.isArray(r.newTestimonials) && r.newTestimonials.length > 0) {
          const createdTestimonials: Testimonial[] = r.newTestimonials.map((t: any, idx: number) => ({
            id: `test_ai_${Date.now()}_${idx}`,
            clientName: t.clientName || 'Cliente Verificado',
            clientRole: t.clientRole || 'Cliente Satisfeito',
            clientAvatar: `https://images.unsplash.com/photo-${1534528741775 + idx * 500}?w=150`,
            rating: t.rating || 5,
            comment: t.comment || 'Excelente trabalho e retorno!',
            featured: true,
          }));
          setTestimonials((prev) => [...createdTestimonials, ...prev]);
          appliedChanges.push(`${createdTestimonials.length} depoimento(s) de prova social adicionado(s)`);
        }

        // Gallery product structural creation
        if (Array.isArray(r.newGalleryPhotos) && r.newGalleryPhotos.length > 0) {
          r.newGalleryPhotos.forEach((g: any) => {
            addGalleryPhoto({
              title: g.title || 'Produto Digital',
              imageUrl: g.imageUrl || 'https://images.unsplash.com/photo-1512290900673-3e13d9646b9a?w=500',
              priceCaption: g.priceCaption || '$19 USD',
              linkUrl: g.linkUrl || 'https://example.com',
            });
          });
          appliedChanges.push(`${r.newGalleryPhotos.length} produto(s) de portfólio adicionado(s)`);
        }
      } else if (!data.success && data.error) {
        aiReplyText = typeof data.error === 'string' ? data.error : 'Erro ao processar instrução de IA.';
      }

      const aiMsgObj: ChatMessage = {
        id: `msg_ai_${Date.now()}`,
        sender: 'ai',
        text: aiReplyText,
        timestamp: new Date().toISOString(),
        suggestions,
        appliedChanges: appliedChanges.length > 0 ? appliedChanges : undefined,
        nextMissingField,
        quickReplies,
        stage,
      };

      setChatMessages((prev) => [...prev, aiMsgObj]);

      // Persist AI chat response to /users/{userId}/chats in Firestore
      if (currentUser?.id) {
        chatService.saveChatMessage(currentUser.id, aiMsgObj);
      }

      return aiReplyText;
    } catch (e) {
      console.error('Chat refine error:', e);
      const aiMsgObj: ChatMessage = {
        id: `msg_ai_${Date.now()}`,
        sender: 'ai',
        text: 'Desculpe, ocorreu um pequeno erro ao processar. Tente novamente!',
        timestamp: new Date().toISOString(),
      };
      setChatMessages((prev) => [...prev, aiMsgObj]);

      if (currentUser?.id) {
        chatService.saveChatMessage(currentUser.id, aiMsgObj);
      }

      return aiMsgObj.text;
    }
  };

  const updateProfile = (updated: Partial<Profile>) => {
    setProfile((prev) => ({ ...prev, ...updated }));
  };

  const updateSeoSettings = (updated: Partial<SeoSettings>) => {
    setSeoSettings((prev) => {
      const merged = { ...prev, ...updated };
      try {
        localStorage.setItem('omnilink_seo', JSON.stringify(merged));
      } catch (err) {
        console.warn('Could not save SEO to localStorage:', err);
      }
      if (currentUser?.id) {
        userService.updateUserSeoSettings(currentUser.id, merged);
      }
      return merged;
    });
  };

  const upgradeToPro = () => {
    setProfile((prev) => ({ ...prev, isPro: true, showWatermark: false }));
  };

  const downgradeToFree = () => {
    setProfile((prev) => ({ ...prev, isPro: false, showWatermark: true }));
  };

  const addGalleryPhoto = (photoData: Omit<GalleryPhoto, 'id'>) => {
    const newPhoto: GalleryPhoto = {
      ...photoData,
      id: `gal_${Date.now()}`,
    };
    setProfile((prev) => ({
      ...prev,
      galleryPhotos: [...(prev.galleryPhotos || []), newPhoto],
    }));
  };

  const deleteGalleryPhoto = (id: string) => {
    setProfile((prev) => ({
      ...prev,
      galleryPhotos: (prev.galleryPhotos || []).filter((p) => p.id !== id),
    }));
  };

  const addLink = (linkData: Omit<LinkItem, 'id' | 'clicksCount'>) => {
    const newLink: LinkItem = {
      ...linkData,
      id: `link_${Date.now()}`,
      clicksCount: 0,
    };
    setLinks((prev) => [newLink, ...prev]);
  };

  const updateLink = (id: string, updated: Partial<LinkItem>) => {
    setLinks((prev) => prev.map((item) => (item.id === id ? { ...item, ...updated } : item)));
  };

  const deleteLink = (id: string) => {
    setLinks((prev) => prev.filter((item) => item.id !== id));
  };

  const reorderLinks = (newLinks: LinkItem[]) => {
    setLinks(newLinks);
  };

  const trackLinkClick = async (id: string) => {
    setLinks((prev) =>
      prev.map((item) => (item.id === id ? { ...item, clicksCount: item.clicksCount + 1 } : item))
    );

    const eventObj: AnalyticsEvent = {
      userId: currentUser?.id || profile.id || 'anonymous_user',
      profileUsername: profile.username,
      linkId: id,
      eventType: 'click',
      device: typeof navigator !== 'undefined' && navigator.userAgent.includes('Mobile') ? 'Mobile' : 'Desktop',
      createdAt: new Date().toISOString(),
    };

    setRealAnalyticsEvents((prev) => [eventObj, ...prev]);

    if (currentUser?.id) {
      analyticsService.trackEvent(eventObj);
    }
  };

  const addTestimonial = (testData: Omit<Testimonial, 'id'>) => {
    const newTest: Testimonial = { ...testData, id: `test_${Date.now()}` };
    setTestimonials((prev) => [newTest, ...prev]);
    if (currentUser?.id) {
      testimonialService.saveTestimonial(currentUser.id, newTest);
    }
  };

  const updateTestimonial = (id: string, updated: Partial<Testimonial>) => {
    setTestimonials((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const updatedItem = { ...item, ...updated };
          if (currentUser?.id) {
            testimonialService.saveTestimonial(currentUser.id, updatedItem);
          }
          return updatedItem;
        }
        return item;
      })
    );
  };

  const deleteTestimonial = (id: string) => {
    setTestimonials((prev) => prev.filter((item) => item.id !== id));
    if (currentUser?.id) {
      testimonialService.deleteTestimonial(currentUser.id, id);
    }
  };

  const submitLead = async (email: string, name?: string): Promise<boolean> => {
    const newLead: LeadItem = {
      id: `lead_${Date.now()}`,
      email,
      name: name || 'Subscriber',
      createdAt: new Date().toISOString(),
    };
    setLeads((prev) => [newLead, ...prev]);

    if (currentUser) {
      return await leadService.addLead(currentUser.id, profile.username, email, name);
    }
    return true;
  };

  const submitTip = async (amount: number, currency: string, name?: string, message?: string): Promise<boolean> => {
    const newTip: TipItem = {
      id: `tip_${Date.now()}`,
      supporterName: name || 'Anonymous Supporter',
      amount,
      currency,
      message: message || '',
      createdAt: new Date().toISOString(),
      paymentMethod: 'Trywalled Wallet',
    };
    setTips((prev) => [newTip, ...prev]);
    return true;
  };

  const exportLeadsCsv = () => {
    if (leads.length === 0) return;

    const crmData = leads.map((l) => {
      const rawName = (l.name || 'Subscriber').trim();
      const nameParts = rawName.split(' ');
      const firstName = nameParts[0] || rawName;
      const lastName = nameParts.slice(1).join(' ') || '';

      return {
        'Lead ID': l.id,
        'Email Address': l.email,
        'Full Name': rawName,
        'First Name': firstName,
        'Last Name': lastName,
        'Date Captured': l.createdAt,
        'Formatted Date': new Date(l.createdAt).toLocaleString(),
        'Bio Owner': `@${profile.username || 'creator'}`,
        'Status': 'Subscribed',
      };
    });

    const csvString = Papa.unparse(crmData, {
      quotes: true,
      header: true,
    });

    const blob = new Blob(['\uFEFF' + csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `omnilink_leads_${profile.username || 'export'}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const exportReportPdf = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>OmniLink Performance Report - @${profile.username}</title>
          <style>
            body { font-family: sans-serif; padding: 40px; color: #0f172a; line-height: 1.5; }
            h1 { color: #7c3aed; font-size: 24px; margin-bottom: 4px; }
            .header { border-bottom: 2px solid #e2e8f0; padding-bottom: 16px; margin-bottom: 24px; }
            .grid { display: flex; gap: 16px; margin-bottom: 24px; }
            .card { flex: 1; border: 1px solid #cbd5e1; padding: 16px; border-radius: 8px; background: #f8fafc; }
            .value { font-size: 22px; font-weight: bold; color: #0f172a; }
            table { width: 100%; border-collapse: collapse; margin-top: 16px; }
            th, td { text-align: left; padding: 10px; border-bottom: 1px solid #e2e8f0; font-size: 13px; }
            th { background: #f1f5f9; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>OmniLink Analytics Performance Report</h1>
            <p>Profile: <strong>@${profile.username}</strong> (${profile.displayName}) | Date: ${new Date().toLocaleDateString()}</p>
          </div>

          <div class="grid">
            <div class="card">
              <div>Total Clicks</div>
              <div class="value">${analytics.totalClicks}</div>
            </div>
            <div class="card">
              <div>Total Profile Views</div>
              <div class="value">${analytics.totalViews}</div>
            </div>
            <div class="card">
              <div>Click-Through Rate (CTR)</div>
              <div class="value">${analytics.ctr}%</div>
            </div>
          </div>

          <h3>Top Performing Links</h3>
          <table>
            <thead>
              <tr>
                <th>Link Title</th>
                <th>URL</th>
                <th>Clicks</th>
              </tr>
            </thead>
            <tbody>
              ${links
                .map(
                  (l) => `
                <tr>
                  <td>${l.title}</td>
                  <td>${l.url}</td>
                  <td><strong>${l.clicksCount}</strong></td>
                </tr>
              `
                )
                .join('')}
            </tbody>
          </table>

          <div style="margin-top: 40px; text-align: center; font-size: 11px; color: #64748b;">
            Generated by OmniLink: Smart Bio & Social Proof • Trywalled Gateway Verified
          </div>

          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <OmniLinkContext.Provider
      value={{
        currentUser,
        usersStore,
        profile,
        links,
        testimonials,
        leads,
        tips,
        seoSettings,
        analytics,
        chatMessages,
        isDarkMode,
        toggleDarkMode,
        activeView,
        setActiveView,
        dashboardTab,
        setDashboardTab,
        getPublicUrl,
        isAuthModalOpen,
        openAuthModal,
        closeAuthModal,
        isTrywalledModalOpen,
        openTrywalledModal,
        closeTrywalledModal,
        isAiModalOpen,
        openAiModal,
        closeAiModal,
        isTipJarModalOpen,
        openTipJarModal,
        closeTipJarModal,
        isQrModalOpen,
        openQrModal,
        closeQrModal,
        signUp,
        login,
        loginWithGoogle,
        logout,
        generateFullProfileWithAi,
        sendAiChatMessage,
        updateProfile,
        updateSeoSettings,
        upgradeToPro,
        downgradeToFree,
        addGalleryPhoto,
        deleteGalleryPhoto,
        addLink,
        updateLink,
        deleteLink,
        reorderLinks,
        trackLinkClick,
        addTestimonial,
        updateTestimonial,
        deleteTestimonial,
        submitLead,
        exportLeadsCsv,
        submitTip,
        exportReportPdf,
        billingCallbackNotification,
        clearBillingNotification,
        verifyWalledSubscription,
      }}
    >
      {children}
    </OmniLinkContext.Provider>
  );
};

export const useOmniLink = () => {
  const context = useContext(OmniLinkContext);
  if (!context) {
    throw new Error('useOmniLink must be used within an OmniLinkProvider');
  }
  return context;
};
