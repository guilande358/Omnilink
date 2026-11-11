import React, { useState } from 'react';
import { useOmniLink } from '../context/OmniLinkContext';
import { LinksTab } from '../components/Dashboard/LinksTab';
import { MediaTab } from '../components/Dashboard/MediaTab';
import { SocialProofWidget } from '../components/Dashboard/SocialProofWidget';
import { LeadCaptureModule } from '../components/Dashboard/LeadCaptureTab';
import { StyleTab } from '../components/Dashboard/StyleTab';
import { SeoTab } from '../components/Dashboard/SeoTab';
import { QrTab } from '../components/Dashboard/QrTab';
import { AnalyticsTab } from '../components/Dashboard/AnalyticsTab';
import { MobileMockup } from '../components/MobileMockup';
import {
  Link2,
  MessageSquareQuote,
  Users,
  Palette,
  BarChart3,
  Wand2,
  Crown,
  Phone,
  ExternalLink,
  Search,
  Share2,
  QrCode,
  Image as ImageIcon,
  Sliders,
  Eye,
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const {
    profile,
    links,
    testimonials,
    dashboardTab,
    setDashboardTab,
    openAiModal,
    openTrywalledModal,
    setActiveView,
    trackLinkClick,
    submitLead,
  } = useOmniLink();

  // Mobile studio view mode state: 'studio' | 'preview'
  const [mobileStudioMode, setMobileStudioMode] = useState<'studio' | 'preview'>('studio');

  const tabs = [
    { id: 'links', label: 'Links & CTAs', icon: Link2 },
    { id: 'media', label: 'Media Gallery', icon: ImageIcon },
    { id: 'social_proof', label: 'Social Proof Reviews', icon: MessageSquareQuote },
    { id: 'leads', label: 'Lead Capture', icon: Users },
    { id: 'style', label: 'Style & Customization', icon: Palette },
    { id: 'seo', label: 'SEO & Social Cards', icon: Share2 },
    { id: 'qr', label: 'QR Code Studio', icon: QrCode },
    { id: 'analytics', label: 'Analytics (Pro)', icon: BarChart3 },
  ] as const;

  return (
    <div className="min-h-[calc(100vh-65px)] bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Top Control Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-200/80 dark:border-slate-800/80">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                Creator Studio Dashboard
              </h1>
              {profile.isPro ? (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 flex items-center gap-1">
                  <Crown className="w-3 h-3 text-amber-500" />
                  <span>Pro Plan Active</span>
                </span>
              ) : (
                <button
                  onClick={openTrywalledModal}
                  className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-amber-100 hover:text-amber-800 transition-colors flex items-center gap-1"
                >
                  <span>Free Plan</span>
                  <Crown className="w-3 h-3 text-amber-500" />
                </button>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-mono">
              omnilink.app/u/{profile.username}
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={openAiModal}
              className="px-3.5 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-bold text-xs rounded-xl shadow transition-all flex items-center gap-1.5"
            >
              <Wand2 className="w-4 h-4" />
              <span>AI Smart Copy</span>
            </button>

            <button
              onClick={() => setActiveView('public')}
              className="px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 text-slate-900 dark:text-white font-bold text-xs rounded-xl transition-all shadow-sm flex items-center gap-1.5"
            >
              <Phone className="w-4 h-4 text-violet-500" />
              <span>Open Bio Page</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </button>
          </div>
        </div>

        {/* Mobile View Toggle Bar (Only visible on screens < lg) */}
        <div className="lg:hidden flex p-1 bg-slate-200/80 dark:bg-slate-900 rounded-2xl mb-6 border border-slate-300/50 dark:border-slate-800">
          <button
            onClick={() => setMobileStudioMode('studio')}
            className={`flex-1 py-2 text-xs font-extrabold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              mobileStudioMode === 'studio'
                ? 'bg-white dark:bg-slate-800 text-violet-600 dark:text-violet-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Studio Editor</span>
          </button>

          <button
            onClick={() => setMobileStudioMode('preview')}
            className={`flex-1 py-2 text-xs font-extrabold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              mobileStudioMode === 'preview'
                ? 'bg-white dark:bg-slate-800 text-violet-600 dark:text-violet-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Eye className="w-4 h-4 text-amber-500" />
            <span>Live Preview</span>
          </button>
        </div>

        {/* Dashboard Main Grid Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Editor Controls & Tabs */}
          <div className={`lg:col-span-7 space-y-6 ${mobileStudioMode === 'preview' ? 'hidden lg:block' : 'block'}`}>
            {/* Tab Segmented Bar */}
            <div className="flex items-center gap-1 p-1.5 bg-slate-200/80 dark:bg-slate-900 rounded-2xl overflow-x-auto border border-slate-300/50 dark:border-slate-800 scrollbar-none">
              {tabs.map((t) => {
                const Icon = t.icon;
                const isActive = dashboardTab === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setDashboardTab(t.id as any)}
                    className={`flex items-center gap-2 px-3 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap shrink-0 ${
                      isActive
                        ? 'bg-white dark:bg-slate-800 text-violet-600 dark:text-violet-400 shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{t.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Render Selected Tab */}
            <div className="transition-all duration-300">
              {dashboardTab === 'links' && <LinksTab />}
              {dashboardTab === 'media' && <MediaTab />}
              {dashboardTab === 'social_proof' && <SocialProofWidget />}
              {dashboardTab === 'leads' && <LeadCaptureModule />}
              {dashboardTab === 'style' && <StyleTab />}
              {dashboardTab === 'seo' && <SeoTab />}
              {dashboardTab === 'qr' && <QrTab />}
              {dashboardTab === 'analytics' && <AnalyticsTab />}
            </div>
          </div>

          {/* Right Column: Sticky Live Mobile Mockup */}
          <div className={`lg:col-span-5 sticky top-20 flex-col items-center ${mobileStudioMode === 'studio' ? 'hidden lg:flex' : 'flex'}`}>
            <div className="w-full mb-2 flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400 px-2">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Live Preview
              </span>
              <button
                onClick={() => setActiveView('public')}
                className="text-violet-600 dark:text-violet-400 hover:underline flex items-center gap-1"
              >
                <span>Fullscreen</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>

            <MobileMockup
              profile={profile}
              links={links}
              testimonials={testimonials}
              onLinkClick={trackLinkClick}
              onLeadSubmit={submitLead}
              onUpgradeClick={openTrywalledModal}
              showBezel={false}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
