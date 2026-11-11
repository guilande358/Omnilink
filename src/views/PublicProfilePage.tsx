import React, { useState } from 'react';
import { useOmniLink } from '../context/OmniLinkContext';
import { MobileMockup } from '../components/MobileMockup';
import { LayoutDashboard, ArrowLeft, Copy, Check, QrCode, Crown, Sparkles } from 'lucide-react';

export const PublicProfilePage: React.FC = () => {
  const {
    profile,
    links,
    testimonials,
    setActiveView,
    trackLinkClick,
    submitLead,
    openTrywalledModal,
    openQrModal,
    getPublicUrl,
  } = useOmniLink();

  const [copied, setCopied] = useState(false);
  const liveUrl = getPublicUrl(profile.username);

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(liveUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getThemeBackground = () => {
    switch (profile.theme) {
      case 'violet':
        return 'bg-gradient-to-b from-violet-900 via-indigo-950 to-slate-950 text-white';
      case 'emerald':
        return 'bg-gradient-to-b from-emerald-900 via-teal-950 to-slate-950 text-white';
      case 'sunset':
        return 'bg-gradient-to-b from-amber-800 via-rose-950 to-slate-950 text-white';
      case 'midnight':
        return 'bg-slate-950 text-slate-100';
      case 'glass':
        return 'bg-slate-900 text-white';
      default:
        return 'bg-slate-900 text-slate-100';
    }
  };

  return (
    <div className={`min-h-screen ${getThemeBackground()} text-white flex flex-col justify-between p-4 sm:p-6 transition-colors`}>
      {/* Top Floating Controls Bar */}
      <div className="max-w-xl mx-auto w-full flex flex-col sm:flex-row items-center justify-between gap-3 py-2.5 px-4 rounded-2xl bg-slate-900/90 border border-slate-800 backdrop-blur-md mb-6 shadow-2xl">
        <button
          onClick={() => setActiveView('dashboard')}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-300 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-violet-400" />
          <span>Back to Creator Studio</span>
        </button>

        <div className="flex items-center gap-2 truncate max-w-full">
          <button
            onClick={handleCopyUrl}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-mono font-semibold text-slate-200 transition-colors flex items-center gap-1.5 truncate shadow-sm"
            title="Click to copy public link"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-400" />
                <span className="truncate">{liveUrl}</span>
              </>
            )}
          </button>

          <button
            onClick={openQrModal}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 transition-colors shrink-0"
            title="View QR Code"
          >
            <QrCode className="w-4 h-4" />
          </button>

          {!profile.isPro && (
            <button
              onClick={openTrywalledModal}
              className="px-2.5 py-1.5 bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 font-extrabold text-[10px] rounded-xl flex items-center gap-1 shadow shrink-0"
            >
              <Crown className="w-3.5 h-3.5 text-slate-950" />
              <span>Pro Trywalled</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Standalone Bezel-Free Landing Container */}
      <div className="w-full my-auto flex items-center justify-center">
        <MobileMockup
          profile={profile}
          links={links}
          testimonials={testimonials}
          onLinkClick={trackLinkClick}
          onLeadSubmit={submitLead}
          onUpgradeClick={openTrywalledModal}
          isStandalonePublic={true}
          showBezel={false}
        />
      </div>

      {/* Footer */}
      <div className="text-center py-4 text-xs text-slate-400">
        <p>© 2026 OmniLink: Smart Bio & Social Proof SaaS. Global conversion platform.</p>
      </div>
    </div>
  );
};
