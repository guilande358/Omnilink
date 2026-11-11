export type ThemeOption = 'slate' | 'violet' | 'emerald' | 'sunset' | 'midnight' | 'glass';
export type ButtonStyle = 'filled' | 'outline' | 'glass' | 'shadow';
export type ButtonAnimation = 'none' | 'pulse' | 'bounce' | 'shine';

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  username: string;
  isPro: boolean;
  createdAt: string;
  seoSettings?: SeoSettings;
  authMethod?: 'google' | 'email';
}

export interface GalleryPhoto {
  id: string;
  imageUrl: string;
  title: string;
  priceCaption?: string;
  linkUrl?: string;
}

export interface SocialLinks {
  instagram?: string;
  tiktok?: string;
  twitter?: string;
  youtube?: string;
  linkedin?: string;
  whatsapp?: string;
}

export interface Profile {
  id: string;
  userId?: string;
  username: string;
  displayName: string;
  bio: string;
  avatarUrl: string;
  theme: ThemeOption;
  font: string;
  buttonStyle: ButtonStyle;
  isPro: boolean;
  showWatermark: boolean;
  customDomain?: string;
  customDomainStatus?: 'verified' | 'pending' | 'unverified';
  bioThemeMode?: 'auto' | 'light' | 'dark';
  socialLinks: SocialLinks;
  leadFormHeadline: string;
  leadFormButtonText: string;
  enableLeadForm?: boolean;
  enableTestimonials?: boolean;
  featuredVideoUrl?: string;
  
  // WhatsApp Direct Sales
  whatsappNumber?: string;
  whatsappWelcomeMessage?: string;
  enableWhatsappButton?: boolean;
  
  // Tip Jar
  enableTipJar?: boolean;
  tipJarHeadline?: string;
  tipJarCurrency?: 'USD' | 'MZN' | 'EUR';

  // Photo Gallery
  galleryPhotos: GalleryPhoto[];
  galleryHeadline?: string;

  // Trywalled Payment Gateway Configuration
  trywalledConfig?: TrywalledConfig;
  walledSubscriptionId?: string;
  billingSupportUrl?: string;
  subscriptionStatus?: 'active' | 'trialing' | 'canceled' | 'none';
}

export interface TrywalledConfig {
  apiKey: string;
  secretKey: string;
  merchantId: string;
  webhookSecret?: string;
  environment: 'live' | 'test';
  isConfigured: boolean;
}

export interface LinkItem {
  id: string;
  title: string;
  url: string;
  icon: string;
  active: boolean;
  clicksCount: number;
  isHighlighted?: boolean;
  animation?: ButtonAnimation;
}

export interface Testimonial {
  id: string;
  clientName: string;
  clientRole: string;
  clientAvatar: string;
  rating: number; // 1 to 5
  comment: string;
  featured: boolean;
}

export interface LeadItem {
  id: string;
  email: string;
  name?: string;
  createdAt: string;
}

export interface TipItem {
  id: string;
  supporterName: string;
  amount: number;
  currency: string;
  message?: string;
  createdAt: string;
  paymentMethod: 'Trywalled Wallet' | 'Trywalled Card' | 'Mobile Money';
}

export interface SeoSettings {
  metaTitle: string;
  metaDescription: string;
  keywords: string;
  ogImageUrl: string;
}

export interface AnalyticsData {
  totalClicks: number;
  totalViews: number;
  ctr: number;
  clicksByDay: { date: string; clicks: number }[];
  hourlyClicks: { hour: string; clicks: number }[];
  deviceBreakdown: { device: string; percentage: number }[];
  countryBreakdown: { country: string; percentage: number }[];
  topReferrers: { source: string; visits: number }[];
}

export interface ArchitectureSuggestion {
  blockType: 'leadForm' | 'testimonials' | 'featuredVideo' | 'whatsapp' | 'tipJar' | 'gallery' | 'highlightedLink' | 'theme' | 'lead_capture' | 'whatsapp_button' | 'video_player' | 'highlighted_links' | 'tip_jar' | 'custom_theme' | string;
  title: string;
  reason: string;
  recommendedAction?: string;
  status?: 'recommended' | 'applied';
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  suggestions?: ArchitectureSuggestion[];
  appliedChanges?: string[];
  nextMissingField?: string;
  quickReplies?: string[];
  stage?: 'architecture_proposal' | 'collecting_info' | 'structure_applied' | 'refinement';
}
