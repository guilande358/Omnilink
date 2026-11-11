import React, { useState } from 'react';
import { useOmniLink } from '../../context/OmniLinkContext';
import { ThemeOption, ButtonStyle } from '../../types';
import { Palette, Crown, Lock, Sparkles, Check, Globe, Moon, Sun, Monitor, CheckCircle2, ShieldCheck, RefreshCw, Server } from 'lucide-react';

export const StyleTab: React.FC = () => {
  const { profile, updateProfile, openTrywalledModal } = useOmniLink();

  const [verifyingDomain, setVerifyingDomain] = useState(false);
  const [domainVerified, setDomainVerified] = useState(profile.customDomainStatus === 'verified');

  const themes: { id: ThemeOption; name: string; bg: string; text: string }[] = [
    { id: 'violet', name: 'Electric Violet', bg: 'bg-gradient-to-tr from-violet-900 to-indigo-950', text: 'text-white' },
    { id: 'emerald', name: 'Vibrant Emerald', bg: 'bg-gradient-to-tr from-emerald-900 to-teal-950', text: 'text-white' },
    { id: 'sunset', name: 'Golden Sunset', bg: 'bg-gradient-to-tr from-amber-800 to-rose-950', text: 'text-white' },
    { id: 'midnight', name: 'Obsidian Night', bg: 'bg-slate-950', text: 'text-slate-100' },
    { id: 'glass', name: 'Glassmorphism', bg: 'bg-slate-900', text: 'text-white' },
    { id: 'slate', name: 'Minimal Slate', bg: 'bg-slate-900', text: 'text-white' },
  ];

  const buttonStyles: { id: ButtonStyle; name: string; desc: string }[] = [
    { id: 'glass', name: 'Glass Translucent', desc: 'Sleek frosted glass with subtle backdrop blur' },
    { id: 'filled', name: 'Gradient Pulse', desc: 'Vibrant solid gradient fill with hover glow' },
    { id: 'outline', name: 'Minimal Border', desc: 'Clean translucent outline border' },
    { id: 'shadow', name: 'Elevated Card', desc: 'Solid white button with deep drop shadow' },
  ];

  const handleVerifyDns = () => {
    if (!profile.customDomain) return;
    setVerifyingDomain(true);
    setTimeout(() => {
      setVerifyingDomain(false);
      setDomainVerified(true);
      updateProfile({ customDomainStatus: 'verified' });
    }, 1500);
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-extrabold tracking-tight">Custom Profile Design & Custom Domain</h2>
          <p className="text-xs text-white/80 mt-0.5">
            Personalize your bio theme, light/dark mode behavior, and map your custom domain name.
          </p>
        </div>
        <div className="px-3 py-1.5 rounded-xl bg-white/20 backdrop-blur-md text-white font-bold text-xs flex items-center gap-1">
          <Palette className="w-4 h-4" />
          <span>Live Styling</span>
        </div>
      </div>

      {/* Profile Details & Avatar */}
      <div className="p-4 sm:p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-4 shadow-sm">
        <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          Profile Avatar & Information
        </h3>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <img
            src={profile.avatarUrl}
            alt={profile.displayName}
            className="w-16 h-16 rounded-full object-cover ring-4 ring-violet-500/20 shrink-0"
          />
          <div className="flex-1 w-full space-y-2">
            <input
              type="text"
              value={profile.displayName}
              onChange={(e) => updateProfile({ displayName: e.target.value })}
              placeholder="Display Name (e.g. Alex Rivera)"
              className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 font-bold"
            />
            <input
              type="url"
              value={profile.avatarUrl}
              onChange={(e) => updateProfile({ avatarUrl: e.target.value })}
              placeholder="Avatar Photo URL"
              className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            Bio Description
          </label>
          <textarea
            rows={2}
            value={profile.bio}
            onChange={(e) => updateProfile({ bio: e.target.value })}
            placeholder="Short bio description..."
            className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
      </div>

      {/* Light / Dark / Auto System Theme Switcher Mode */}
      <div className="p-4 sm:p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-3 shadow-sm">
        <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <Monitor className="w-4 h-4 text-purple-500" />
          <span>Public Page Theme Switcher Mode</span>
        </h3>

        <p className="text-xs text-slate-500 dark:text-slate-400">
          Choose whether your public bio page defaults to Light mode, Dark mode, or follows the visitor's device system setting automatically.
        </p>

        <div className="grid grid-cols-3 gap-2.5 pt-1">
          <button
            type="button"
            onClick={() => updateProfile({ bioThemeMode: 'auto' })}
            className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 ${
              (profile.bioThemeMode || 'auto') === 'auto'
                ? 'border-purple-600 bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 ring-2 ring-purple-500/20'
                : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
            }`}
          >
            <Monitor className="w-5 h-5 text-purple-500" />
            <span className="text-xs font-bold">Auto (System)</span>
          </button>

          <button
            type="button"
            onClick={() => updateProfile({ bioThemeMode: 'light' })}
            className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 ${
              profile.bioThemeMode === 'light'
                ? 'border-purple-600 bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 ring-2 ring-purple-500/20'
                : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
            }`}
          >
            <Sun className="w-5 h-5 text-amber-500" />
            <span className="text-xs font-bold">Light Override</span>
          </button>

          <button
            type="button"
            onClick={() => updateProfile({ bioThemeMode: 'dark' })}
            className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 ${
              profile.bioThemeMode === 'dark'
                ? 'border-purple-600 bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 ring-2 ring-purple-500/20'
                : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
            }`}
          >
            <Moon className="w-5 h-5 text-indigo-400" />
            <span className="text-xs font-bold">Dark Override</span>
          </button>
        </div>
      </div>

      {/* Custom Domain Configuration Panel */}
      <div className="p-4 sm:p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-purple-600 text-white">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Custom Domain Mapping (CNAME)
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Connect your own custom domain name (e.g. bio.yourbrand.com) to your bio link.
              </p>
            </div>
          </div>

          {!profile.isPro && (
            <span className="px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 flex items-center gap-1">
              <Crown className="w-3 h-3 text-amber-500" />
              <span>Pro Plan</span>
            </span>
          )}
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Your Custom Subdomain or Root Domain
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={profile.customDomain || ''}
                onChange={(e) => {
                  updateProfile({ customDomain: e.target.value, customDomainStatus: 'pending' });
                  setDomainVerified(false);
                }}
                placeholder="e.g. links.alexrivera.io"
                className="flex-1 px-3.5 py-2 text-xs font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <button
                type="button"
                onClick={handleVerifyDns}
                disabled={!profile.customDomain || verifyingDomain}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl transition-all shadow shrink-0 flex items-center gap-1.5 disabled:opacity-50"
              >
                {verifyingDomain ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Server className="w-3.5 h-3.5" />
                )}
                <span>{verifyingDomain ? 'Checking DNS...' : 'Verify DNS'}</span>
              </button>
            </div>
          </div>

          {/* DNS CNAME Configuration Box */}
          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl space-y-2 text-xs">
            <div className="font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
              <span>Required DNS CNAME Record Entry</span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> SSL Auto Provisioned
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 font-mono text-[11px]">
              <div className="p-2 bg-white dark:bg-slate-900 border rounded-lg">
                <span className="block text-[9px] uppercase text-slate-400 font-sans">Type</span>
                <span className="font-bold text-purple-600">CNAME</span>
              </div>
              <div className="p-2 bg-white dark:bg-slate-900 border rounded-lg">
                <span className="block text-[9px] uppercase text-slate-400 font-sans">Host</span>
                <span className="font-bold text-slate-800 dark:text-white">@ / links / bio</span>
              </div>
              <div className="p-2 bg-white dark:bg-slate-900 border rounded-lg">
                <span className="block text-[9px] uppercase text-slate-400 font-sans">Target Value</span>
                <span className="font-bold text-emerald-600">cname.omnilink.app</span>
              </div>
            </div>
          </div>

          {/* Verification Status Banner */}
          {domainVerified && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Domain {profile.customDomain} is verified & pointing to cname.omnilink.app!</span>
            </div>
          )}
        </div>
      </div>

      {/* Theme Presets Picker */}
      <div className="p-4 sm:p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-3 shadow-sm">
        <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          Color Palette & Theme Preset
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {themes.map((t) => (
            <button
              key={t.id}
              onClick={() => updateProfile({ theme: t.id })}
              className={`p-3 rounded-2xl border text-left transition-all flex items-center justify-between gap-2 ${
                profile.theme === t.id
                  ? 'border-purple-500 ring-2 ring-purple-500/30'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center gap-2 truncate">
                <div className={`w-6 h-6 rounded-lg ${t.bg} shrink-0 ring-1 ring-white/20`} />
                <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                  {t.name}
                </span>
              </div>
              {profile.theme === t.id && <Check className="w-4 h-4 text-purple-600 shrink-0" />}
            </button>
          ))}
        </div>
      </div>

      {/* Button Style Picker */}
      <div className="p-4 sm:p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-3 shadow-sm">
        <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          Button Visual Style
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {buttonStyles.map((style) => (
            <button
              key={style.id}
              onClick={() => updateProfile({ buttonStyle: style.id })}
              className={`p-3.5 rounded-2xl border text-left transition-all ${
                profile.buttonStyle === style.id
                  ? 'border-purple-500 bg-purple-50/50 dark:bg-purple-950/30 ring-2 ring-purple-500/20'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
              }`}
            >
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">{style.name}</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{style.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Watermark Paywall Toggle */}
      <div className="p-4 sm:p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center justify-between gap-4 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white">
              OmniLink Watermark Badge
            </h3>
            {!profile.isPro && (
              <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 flex items-center gap-1">
                <Crown className="w-3 h-3 text-amber-500" />
                <span>Pro Only</span>
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Remove "Powered by OmniLink" branding badge from the bottom of your bio page.
          </p>
        </div>

        {profile.isPro ? (
          <button
            onClick={() => updateProfile({ showWatermark: !profile.showWatermark })}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
              !profile.showWatermark
                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
            }`}
          >
            {!profile.showWatermark ? 'Watermark Removed' : 'Show Watermark'}
          </button>
        ) : (
          <button
            onClick={openTrywalledModal}
            className="px-3.5 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-xs rounded-xl shadow hover:shadow-md transition-all flex items-center gap-1 shrink-0"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Unlock Pro ($9/mo)</span>
          </button>
        )}
      </div>
    </div>
  );
};
