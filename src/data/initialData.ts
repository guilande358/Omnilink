import { Profile, LinkItem, Testimonial, LeadItem, GalleryPhoto } from '../types';

export const INITIAL_GALLERY_PHOTOS: GalleryPhoto[] = [
  {
    id: 'gal_1',
    imageUrl: 'https://images.unsplash.com/photo-1512290900673-3e13d9646b9a?w=500&auto=format&fit=crop&q=80',
    title: 'Minimal SaaS Dashboard Kit',
    priceCaption: '$19 USD',
    linkUrl: 'https://example.com/saas-kit',
  },
  {
    id: 'gal_2',
    imageUrl: 'https://images.unsplash.com/photo-1522542550221-31fd19575a2d?w=500&auto=format&fit=crop&q=80',
    title: 'Mobile App Wireframe System',
    priceCaption: '$12 USD',
    linkUrl: 'https://example.com/mobile-kit',
  },
  {
    id: 'gal_3',
    imageUrl: 'https://images.unsplash.com/photo-1542744094-3a31b272c490?w=500&auto=format&fit=crop&q=80',
    title: '1-on-1 Product Audit Session',
    priceCaption: '$65 USD',
    linkUrl: 'https://calendly.com',
  },
];

export const DEFAULT_PROFILES: Profile[] = [
  {
    id: 'prof_1',
    username: 'alex_creator',
    displayName: 'Alex Rivera',
    bio: 'Product Designer & Digital Creator. Helping founders build high-converting SaaS apps & digital products.',
    avatarUrl: '/src/assets/images/avatar_creator_1_1793689957643.jpg',
    theme: 'violet',
    font: 'Plus Jakarta Sans',
    buttonStyle: 'glass',
    isPro: false,
    showWatermark: true,
    socialLinks: {
      instagram: 'https://instagram.com',
      tiktok: 'https://tiktok.com',
      twitter: 'https://twitter.com',
      youtube: 'https://youtube.com',
      linkedin: 'https://linkedin.com',
      whatsapp: 'https://wa.me/12025550192',
    },
    leadFormHeadline: 'Get my Free SaaS UI Kit & Design System',
    leadFormButtonText: 'Download Free Kit ($0)',
    enableLeadForm: true,
    enableTestimonials: true,
    featuredVideoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    whatsappNumber: '+12025550192',
    whatsappWelcomeMessage: 'Hello! I saw your link on OmniLink and would love to collaborate.',
    enableWhatsappButton: true,
    enableTipJar: true,
    tipJarHeadline: 'Support my digital work with a coffee ☕',
    tipJarCurrency: 'USD',
    galleryHeadline: 'Digital Products & Portfolio',
    galleryPhotos: INITIAL_GALLERY_PHOTOS,
  },
];

export const INITIAL_LINKS: LinkItem[] = [
  {
    id: 'link_1',
    title: '⚡ UI Kit 2026 (Free Download)',
    url: 'https://example.com/ui-kit',
    icon: 'Sparkles',
    active: true,
    clicksCount: 1420,
    isHighlighted: true,
    animation: 'pulse',
  },
  {
    id: 'link_2',
    title: '🚀 Book 1-on-1 Design Audit Call',
    url: 'https://calendly.com',
    icon: 'Calendar',
    active: true,
    clicksCount: 890,
    isHighlighted: false,
  },
  {
    id: 'link_3',
    title: '🛍️ Shop Digital Assets & Templates',
    url: 'https://gumroad.com',
    icon: 'ShoppingBag',
    active: true,
    clicksCount: 654,
    isHighlighted: false,
  },
  {
    id: 'link_4',
    title: '🎙️ SaaS Founders Podcast (Ep. 42)',
    url: 'https://spotify.com',
    icon: 'Headphones',
    active: true,
    clicksCount: 312,
    isHighlighted: false,
  },
];

export const INITIAL_TESTIMONIALS: Testimonial[] = [
  {
    id: 'test_1',
    clientName: 'Sarah Jenkins',
    clientRole: 'Founder, TechFlow',
    clientAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    rating: 5,
    comment: 'Working with Alex transformed our product UI. Conversion rates shot up by 38% in the first month!',
    featured: true,
  },
  {
    id: 'test_2',
    clientName: 'David Chen',
    clientRole: 'CEO, Nexus Analytics',
    clientAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    rating: 5,
    comment: 'The UI Kit saved us weeks of design time. Best investment we made this quarter.',
    featured: true,
  },
];

export const INITIAL_LEADS: LeadItem[] = [
  {
    id: 'lead_1',
    email: 'marcus.v@company.io',
    name: 'Marcus Vance',
    createdAt: '2026-11-02T18:30:00.000Z',
  },
];
