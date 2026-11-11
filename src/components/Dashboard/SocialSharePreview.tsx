import React, { useState } from 'react';
import { SeoSettings, Profile } from '../../types';
import {
  Globe,
  Share2,
  Copy,
  Check,
  ExternalLink,
  MessageCircle,
  Twitter,
  Search,
  Sparkles,
  Info,
} from 'lucide-react';

interface SocialSharePreviewProps {
  seoSettings: SeoSettings;
  profile: Profile;
  publicUrl?: string;
}

export const SocialSharePreview: React.FC<SocialSharePreviewProps> = ({
  seoSettings,
  profile,
  publicUrl,
}) => {
  const [platform, setPlatform] = useState<'whatsapp' | 'twitter' | 'google'>('whatsapp');
  const [copied, setCopied] = useState(false);

  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://omnilinksbio.ai.studio';
  const shareUrl = publicUrl || `${currentOrigin}/u/${profile.username || 'creator'}`;
  const displayTitle = seoSettings.metaTitle || `${profile.displayName} | OmniLink Smart Bio`;
  const displayDescription =
    seoSettings.metaDescription ||
    profile.bio ||
    'Official bio link and digital services portfolio. Connect and explore links.';
  const displayImage =
    seoSettings.ogImageUrl ||
    profile.avatarUrl ||
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600';

  const handleCopyLink = () => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4">
      {/* Header and Platform Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Share2 className="w-4 h-4 text-violet-500" />
            <span>Social Share Card Live Preview</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time rendering of your Open Graph and Twitter card tags across social platforms.
          </p>
        </div>

        {/* Platform Selection Tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl shrink-0">
          <button
            type="button"
            onClick={() => setPlatform('whatsapp')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              platform === 'whatsapp'
                ? 'bg-emerald-500 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>WhatsApp</span>
          </button>

          <button
            type="button"
            onClick={() => setPlatform('twitter')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              platform === 'twitter'
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Twitter className="w-3.5 h-3.5" />
            <span>Twitter / X</span>
          </button>

          <button
            type="button"
            onClick={() => setPlatform('google')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              platform === 'google'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>Google SERP</span>
          </button>
        </div>
      </div>

      {/* Preview Screen Body */}
      <div className="relative">
        {/* 1. WHATSAPP PREVIEW */}
        {platform === 'whatsapp' && (
          <div className="bg-[#efeae2] dark:bg-[#0b141a] p-4 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-inner flex flex-col items-start transition-colors">
            <div className="w-full max-w-sm bg-white dark:bg-[#1f2c34] rounded-2xl rounded-tl-sm shadow-md overflow-hidden border border-slate-200/60 dark:border-slate-700/60 transition-colors">
              {/* Card Image Banner */}
              <div className="relative aspect-[1.91/1] w-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <img
                  src={displayImage}
                  alt={displayTitle}
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                  onError={(e) => {
                    e.currentTarget.src = profile.avatarUrl;
                  }}
                />
                <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-white text-[10px] font-mono">
                  og:image
                </div>
              </div>

              {/* Card Text Content */}
              <div className="p-3 bg-[#f7f8fa] dark:bg-[#111b21] border-t border-slate-200/60 dark:border-slate-700/60 space-y-1">
                <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 line-clamp-1">
                  {displayTitle}
                </h4>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                  {displayDescription}
                </p>
                <div className="pt-1 flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                  <span>{shareUrl.replace(/^https?:\/\//, '')}</span>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-sans font-medium">
                    OmniLink
                  </span>
                </div>
              </div>

              {/* Simulated chat footer */}
              <div className="px-3 py-1.5 bg-white dark:bg-[#1f2c34] flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                <span className="font-mono text-emerald-600 dark:text-emerald-400 font-medium">
                  {shareUrl}
                </span>
                <span className="text-[10px] text-slate-400">12:30 PM ✓✓</span>
              </div>
            </div>

            <div className="mt-3 text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Simulated WhatsApp bubble showing auto-expanded OpenGraph card</span>
            </div>
          </div>
        )}

        {/* 2. TWITTER / X SUMMARY LARGE IMAGE CARD PREVIEW */}
        {platform === 'twitter' && (
          <div className="bg-slate-100 dark:bg-black p-4 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-inner flex flex-col items-start transition-colors">
            <div className="w-full max-w-md bg-white dark:bg-[#16181c] rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm space-y-3">
              {/* Tweet Header */}
              <div className="flex items-center gap-3">
                <img
                  src={profile.avatarUrl}
                  alt={profile.displayName}
                  className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                />
                <div className="leading-tight">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {profile.displayName}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      @{profile.username || 'creator'}
                    </span>
                    <span className="text-xs text-slate-400">· 2m</span>
                  </div>
                  <p className="text-xs text-slate-700 dark:text-slate-300 mt-1">
                    Check out my official link in bio on OmniLink! 🚀👇
                  </p>
                </div>
              </div>

              {/* Twitter Large Summary Card */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-700/80 overflow-hidden bg-slate-50 dark:bg-[#000000] hover:border-slate-300 dark:hover:border-slate-600 transition-colors cursor-pointer">
                <div className="relative aspect-[1.91/1] w-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                  <img
                    src={displayImage}
                    alt={displayTitle}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = profile.avatarUrl;
                    }}
                  />
                  <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-white text-[10px] font-mono">
                    twitter:card
                  </div>
                </div>

                <div className="p-3 space-y-1">
                  <div className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                    <Globe className="w-3 h-3" />
                    <span>{new URL(shareUrl).hostname}</span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">
                    {displayTitle}
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-snug">
                    {displayDescription}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-3 text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              <span>Twitter / X `summary_large_image` player card format</span>
            </div>
          </div>
        )}

        {/* 3. GOOGLE SERP SEARCH SNIPPET PREVIEW */}
        {platform === 'google' && (
          <div className="bg-slate-50 dark:bg-slate-950 p-4 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-inner flex flex-col items-start transition-colors">
            <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-sm space-y-2">
              {/* Google Breadcrumb */}
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-violet-100 dark:bg-violet-950 flex items-center justify-center text-violet-600 dark:text-violet-400 text-xs font-bold">
                  OL
                </div>
                <div className="text-xs text-slate-700 dark:text-slate-300 flex items-center gap-1 font-mono">
                  <span>OmniLink</span>
                  <span className="text-slate-400">›</span>
                  <span className="text-slate-500">u</span>
                  <span className="text-slate-400">›</span>
                  <span className="text-slate-500">{profile.username || 'creator'}</span>
                </div>
              </div>

              {/* Google Clickable Blue Title */}
              <h4 className="text-base font-medium text-blue-600 dark:text-blue-400 hover:underline cursor-pointer">
                {displayTitle}
              </h4>

              {/* Google Snippet Description */}
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-2">
                {displayDescription}
              </p>

              {/* Meta Tags Quick Specs */}
              <div className="pt-2 flex items-center gap-3 text-[10px] text-slate-400 font-mono">
                <span>Title: {displayTitle.length} chars</span>
                <span>•</span>
                <span>Desc: {displayDescription.length} chars</span>
                <span>•</span>
                <span className="text-emerald-600 dark:text-emerald-400">Valid Length</span>
              </div>
            </div>

            <div className="mt-3 text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span>Google Desktop & Mobile Search Engine Result Page (SERP) snippet preview</span>
            </div>
          </div>
        )}
      </div>

      {/* Share URL Bar & Actions */}
      <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700/60 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 min-w-0">
          <Globe className="w-4 h-4 text-violet-500 shrink-0" />
          <span className="font-mono text-slate-700 dark:text-slate-300 truncate">
            {shareUrl}
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleCopyLink}
            className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 font-bold hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors flex items-center gap-1.5 shadow-sm"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied!' : 'Copy Share URL'}</span>
          </button>

          <a
            href={shareUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-bold transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Open Link</span>
          </a>
        </div>
      </div>
    </div>
  );
};
