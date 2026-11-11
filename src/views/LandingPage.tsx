import React from 'react';
import { useOmniLink } from '../context/OmniLinkContext';
import { MobileMockup } from '../components/MobileMockup';
import { Profile, LinkItem, Testimonial } from '../types';
import {
  Link2,
  Sparkles,
  ArrowRight,
  MessageSquareQuote,
  Zap,
  BarChart3,
  Mail,
  Crown,
  CheckCircle2,
  ChevronRight,
  TrendingUp,
  Star,
  Check,
} from 'lucide-react';

// Showcase Creator Profile for Global Conversion
const SHOWCASE_CREATOR_PROFILE: Profile = {
  id: 'showcase_alex_rivera',
  displayName: 'Alex Rivera',
  username: 'alexrivera',
  bio: 'Senior Product Designer & Global Creator. Building high-converting digital design systems & tools.',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
  theme: 'glass',
  font: 'Plus Jakarta Sans',
  buttonStyle: 'glass',
  isPro: true,
  showWatermark: false,
  socialLinks: {
    twitter: 'https://twitter.com',
    instagram: 'https://instagram.com',
    linkedin: 'https://linkedin.com',
  },
  leadFormHeadline: 'Receba Templates Exclusivos Grátis',
  leadFormButtonText: 'Quero Acessar Agora',
  whatsappNumber: '+1234567890',
  whatsappWelcomeMessage: 'Olá Alex! Vi o seu perfil no OmniLink e gostaria de saber mais.',
  enableWhatsappButton: true,
  enableTipJar: true,
  tipJarHeadline: 'Apoie o meu trabalho com um café ☕',
  tipJarCurrency: 'USD',
  galleryPhotos: [],
};

const SHOWCASE_LINKS: LinkItem[] = [
  {
    id: 'showcase_link_1',
    title: '🚀 UI/UX Design System 2026 (Figma)',
    url: 'https://figma.com',
    icon: 'Sparkles',
    active: true,
    clicksCount: 1842,
    isHighlighted: true,
    animation: 'shine',
  },
  {
    id: 'showcase_link_2',
    title: '🎙️ The Global Creator Podcast (Ep. 42)',
    url: 'https://spotify.com',
    icon: 'Youtube',
    active: true,
    clicksCount: 932,
    isHighlighted: false,
  },
  {
    id: 'showcase_link_3',
    title: '💼 Agendar Consultoria 1:1 de Produto',
    url: 'https://cal.com',
    icon: 'MessageCircle',
    active: true,
    clicksCount: 615,
    isHighlighted: false,
  },
];

const SHOWCASE_TESTIMONIALS: Testimonial[] = [
  {
    id: 'showcase_test_1',
    clientName: 'Sofia Chen',
    clientRole: 'Founder @ TechStudio',
    clientAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&auto=format&fit=crop&q=80',
    comment: 'O template aumentou nossa conversão de leads em 42%! A melhor bio do mercado.',
    rating: 5,
    featured: true,
  },
  {
    id: 'showcase_test_2',
    clientName: 'Marcus Vance',
    clientRole: 'Product Lead',
    clientAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    comment: 'Transparência e prova social que realmente vendem. Excelente ferramenta.',
    rating: 5,
    featured: true,
  },
];

export const LandingPage: React.FC = () => {
  const { setActiveView, openTrywalledModal } = useOmniLink();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      {/* Hero Section */}
      <section className="relative pt-8 pb-16 sm:pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden">
        {/* Abstract Ambient Gradient Glow behind Hero */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-gradient-to-tr from-violet-600/20 via-indigo-600/15 to-emerald-500/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center relative z-10">
          {/* Left Column: Hero Headlines & Value Proposition */}
          <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-violet-100 dark:bg-violet-950/60 border border-violet-200 dark:border-violet-800 text-violet-700 dark:text-violet-300 text-xs font-bold shadow-sm">
              <Link2 className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" />
              <span>OmniLink Smart Bio & Social Proof SaaS</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.12]">
              The Link in Bio That{' '}
              <span className="bg-gradient-to-r from-violet-600 via-indigo-600 to-emerald-500 bg-clip-text text-transparent">
                Sells For You
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
              Combine dynamic link aggregation, live customer social proof carousels, lead email capture, and Trywalled recurring subscriptions in one high-converting bio profile.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <button
                onClick={() => setActiveView('dashboard')}
                className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white font-extrabold text-sm rounded-2xl shadow-xl shadow-violet-500/25 transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
              >
                <span>Criar Minha Bio Grátis</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => setActiveView('public')}
                className="w-full sm:w-auto px-6 py-4 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-bold text-sm rounded-2xl transition-all shadow-sm flex items-center justify-center gap-2"
              >
                <span>Ver Demonstração ao Vivo</span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            {/* Social Trust Metrics */}
            <div className="pt-6 border-t border-slate-200/80 dark:border-slate-800/80 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-slate-500 dark:text-slate-400 font-medium">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Zero Código Necessário</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Checkout Oficial Trywalled Pro</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>+38% Taxa de Conversão</span>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Visual Showcase (Capa Visual Principal com Glassmorphism) */}
          <div className="lg:col-span-6 flex justify-center relative w-full max-w-lg lg:max-w-none mx-auto">
            {/* Controlled Glow Effect behind the Studio Showcase Container */}
            <div
              className="absolute -inset-2 sm:-inset-6 bg-radial from-violet-500/20 via-blue-500/15 to-transparent blur-2xl rounded-full pointer-events-none"
              style={{
                background: 'radial-gradient(circle, rgba(124, 58, 237, 0.18) 0%, rgba(59, 130, 246, 0.14) 45%, rgba(16, 185, 129, 0.05) 75%, transparent 100%)',
              }}
            />

            {/* Deep Glassmorphism Studio Creation Canvas Container */}
            <div className="relative w-full rounded-3xl p-3 sm:p-5 backdrop-blur-md bg-white/70 dark:bg-white/10 border border-slate-200/80 dark:border-white/15 shadow-2xl transition-all duration-300">
              {/* Studio Canvas Top Window Bar */}
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200/60 dark:border-white/10 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-400/80" />
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400/80" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400/80" />
                  <span className="ml-2 font-mono text-[11px] font-semibold text-slate-500 dark:text-slate-400 hidden sm:inline">
                    OmniLink Studio • Live Canvas
                  </span>
                </div>

                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/80 dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 shadow-xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  <span className="text-[10px] font-mono font-bold text-slate-700 dark:text-slate-300">
                    alexrivera.bio
                  </span>
                </div>
              </div>

              {/* Showcase Container Wrapping Mobile Mockup & Satellite Floating Cards */}
              <div className="relative flex justify-center py-2 sm:py-4">
                {/* 1. Floating Satellite Card: Green Social Proof Review */}
                <div className="absolute -top-1 -left-2 sm:-left-6 z-20 backdrop-blur-md bg-white/95 dark:bg-slate-900/90 border border-emerald-500/40 rounded-2xl p-2.5 sm:p-3 shadow-xl drop-shadow-xl flex items-center gap-2 sm:gap-2.5 max-w-[210px] sm:max-w-[240px] transform hover:scale-105 transition-transform duration-200">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                    <Check className="w-4 h-4 sm:w-4.5 sm:h-4.5 stroke-[3]" />
                  </div>
                  <div className="text-left">
                    <p className="text-[10px] sm:text-[11px] font-bold text-emerald-700 dark:text-emerald-300 leading-snug">
                      ✓ Nova Avaliação de Cliente Adicionada
                    </p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <div className="flex text-amber-400">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                      <span className="text-[9px] font-extrabold text-slate-500 dark:text-slate-400">+5★</span>
                    </div>
                  </div>
                </div>

                {/* 2. Floating Satellite Card: Blue Pro Analytics CTR */}
                <div className="absolute top-28 sm:top-24 -right-2 sm:-right-6 z-20 backdrop-blur-md bg-white/95 dark:bg-slate-900/90 border border-blue-500/40 rounded-2xl p-2.5 sm:p-3 shadow-xl drop-shadow-xl flex items-center gap-2.5 transform hover:scale-105 transition-transform duration-200">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                    <TrendingUp className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                  </div>
                  <div className="text-left">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] sm:text-xs font-extrabold text-slate-900 dark:text-white">
                        CTR da Bio: 24.8% 📈
                      </span>
                    </div>
                    {/* Ascending mini bar chart */}
                    <div className="flex items-end gap-1 h-4 mt-1">
                      <div className="w-1.5 h-1.5 bg-blue-300 dark:bg-blue-600 rounded-xs" />
                      <div className="w-1.5 h-2.5 bg-blue-400 dark:bg-blue-500 rounded-xs" />
                      <div className="w-1.5 h-3 bg-indigo-500 rounded-xs" />
                      <div className="w-1.5 h-3.5 bg-violet-500 rounded-xs" />
                      <div className="w-1.5 h-4 bg-emerald-500 rounded-xs animate-pulse" />
                    </div>
                  </div>
                </div>

                {/* 3. Floating Satellite Card: Email Lead Capture Balloon */}
                <div className="absolute -bottom-2 sm:-bottom-4 left-1/2 -translate-x-1/2 sm:translate-x-0 sm:left-4 z-20 backdrop-blur-md bg-white/95 dark:bg-slate-900/90 border border-indigo-500/30 rounded-2xl px-3 sm:px-4 py-2 sm:py-2.5 shadow-xl drop-shadow-xl flex items-center gap-2 text-xs font-semibold whitespace-nowrap transform hover:scale-105 transition-transform duration-200">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                  </span>
                  <Mail className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                  <span className="text-[11px] sm:text-xs text-slate-800 dark:text-slate-200">
                    📧 Novo Lead:{' '}
                    <span className="font-mono font-bold text-violet-600 dark:text-violet-400">
                      maria@company.com
                    </span>
                  </span>
                </div>

                {/* Live Mobile Mockup displaying fictional success creator "Alex Rivera" */}
                <div className="scale-90 sm:scale-95 transition-transform origin-top">
                  <MobileMockup
                    profile={SHOWCASE_CREATOR_PROFILE}
                    links={SHOWCASE_LINKS}
                    testimonials={SHOWCASE_TESTIMONIALS}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Bento Grid */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-200/80 dark:border-slate-800/80">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Built to Convert Social Traffic Into Revenue
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Everything creators & businesses need to aggregate links, build trust, and collect leads.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm space-y-3">
            <div className="p-3 w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <MessageSquareQuote className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
              Social Proof Review Carousel
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Embed real client testimonials, star ratings, and avatars directly on your bio page to build instant buyer trust.
            </p>
          </div>

          <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm space-y-3">
            <div className="p-3 w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Mail className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
              Lead Email Magnet Capture
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Capture visitor emails with free downloadable guides and lead magnets. Export subscribers directly to CSV.
            </p>
          </div>

          <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm space-y-3">
            <div className="p-3 w-12 h-12 rounded-2xl bg-violet-100 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 flex items-center justify-center">
              <BarChart3 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
              Advanced Click Analytics
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Monitor link performance, total views, click-through rates (CTR), and geographical traffic distribution.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Section with Trywalled Trigger */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center border-t border-slate-200/80 dark:border-slate-800/80">
        <div className="max-w-xl mx-auto mb-10 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 text-xs font-bold">
            <Crown className="w-3.5 h-3.5 text-amber-500" />
            <span>Monetization & Pricing</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
            Simple, High-Value Pricing
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            Start for free. Upgrade to Pro anytime to remove watermark & unlock advanced analytics.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch text-left">
          {/* Free Plan */}
          <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-6 flex flex-col justify-between shadow-sm">
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Free Starter Plan</h3>
              <div className="text-3xl font-black text-slate-900 dark:text-white">$0</div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Perfect for personal profiles & emerging content creators.
              </p>
              <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
                <li className="flex items-center gap-2">✓ Unlimited Links & Reordering</li>
                <li className="flex items-center gap-2">✓ Social Proof Reviews Carousel</li>
                <li className="flex items-center gap-2">✓ Basic Profile Themes</li>
                <li className="flex items-center gap-2 text-slate-400">✗ OmniLink Watermark Included</li>
              </ul>
            </div>

            <button
              onClick={() => setActiveView('dashboard')}
              className="w-full py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-bold text-xs rounded-xl transition-colors"
            >
              Começar Grátis
            </button>
          </div>

          {/* Pro Plan (Trywalled) */}
          <div className="p-6 bg-gradient-to-b from-slate-900 via-slate-900 to-violet-950 text-white border-2 border-violet-500 rounded-3xl space-y-6 flex flex-col justify-between shadow-xl relative overflow-hidden">
            <div className="absolute top-3 right-3 px-2.5 py-1 bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 font-extrabold text-[10px] uppercase rounded-full shadow">
              Trywalled Gateway
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold">Pro Business Plan</h3>
                <Crown className="w-5 h-5 text-amber-400" />
              </div>
              <div className="text-3xl font-black text-white">
                $9 <span className="text-xs font-normal text-slate-400">/ mês</span>
              </div>
              <p className="text-xs text-slate-300">
                Para criadores e empresas que buscam alta conversão e branding profissional.
              </p>
              <ul className="space-y-2 text-xs text-slate-200">
                <li className="flex items-center gap-2">✓ <strong>Remover Marca d'Água OmniLink</strong></li>
                <li className="flex items-center gap-2">✓ Analytics Avançado de Cliques & Países</li>
                <li className="flex items-center gap-2">✓ Gerador de Copy & Bio com Inteligência Artificial</li>
                <li className="flex items-center gap-2">✓ Temas Personalizados & Estilo Glassmorphism</li>
                <li className="flex items-center gap-2">✓ Suporte Prioritário & Domínio Próprio</li>
              </ul>
            </div>

            <button
              onClick={openTrywalledModal}
              className="w-full py-3.5 bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2"
            >
              <Zap className="w-4 h-4 fill-slate-950" />
              <span>Assinar Plano Pro ($9/mês)</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
