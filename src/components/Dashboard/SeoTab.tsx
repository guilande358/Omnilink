import React, { useState } from 'react';
import { useOmniLink } from '../../context/OmniLinkContext';
import { userService } from '../../services/firestoreService';
import { SocialSharePreview } from './SocialSharePreview';
import {
  Globe,
  MessageCircle,
  Share2,
  Sparkles,
  Check,
  Search,
  Save,
  CloudCheck,
  Image as ImageIcon,
  ExternalLink,
  ShieldCheck,
  Tag,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';

const PRESET_SHARE_IMAGES = [
  {
    label: 'Profile Avatar',
    url: '', // will be set dynamically to profile.avatarUrl
    desc: 'Uses your profile photo',
  },
  {
    label: 'Creator Studio Pro',
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80',
    desc: 'Abstract violet & neon gradient',
  },
  {
    label: 'Executive & Business',
    url: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1200&auto=format&fit=crop&q=80',
    desc: 'Modern tech workspace',
  },
  {
    label: 'Digital Agency / Dark Mode',
    url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200&auto=format&fit=crop&q=80',
    desc: 'Clean dark tech aesthetic',
  },
];

export const SeoTab: React.FC = () => {
  const {
    profile,
    updateProfile,
    seoSettings,
    updateSeoSettings,
    currentUser,
    openAiModal,
    getPublicUrl,
  } = useOmniLink();

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const publicUrl = getPublicUrl ? getPublicUrl() : undefined;

  // Title & description validation counts
  const titleLength = seoSettings.metaTitle?.length || 0;
  const isTitleOptimal = titleLength >= 30 && titleLength <= 60;

  const descLength = seoSettings.metaDescription?.length || 0;
  const isDescOptimal = descLength >= 80 && descLength <= 160;

  const handleManualSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!currentUser?.id) {
      setSaveError('Faça login para salvar suas configurações permanentemente no Firestore.');
      setTimeout(() => setSaveError(null), 4000);
      return;
    }

    setIsSaving(true);
    setSaveSuccess(false);
    setSaveError(null);

    try {
      const ok = await userService.updateUserSeoSettings(currentUser.id, seoSettings);
      if (ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        setSaveError('Erro ao sincronizar com o Firestore. Tente novamente.');
      }
    } catch (err: any) {
      setSaveError(err.message || 'Erro ao salvar no Firestore');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSelectPresetImage = (url: string) => {
    const targetUrl = url || profile.avatarUrl;
    updateSeoSettings({ ogImageUrl: targetUrl });
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white shadow-lg shadow-emerald-500/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-extrabold tracking-tight">SEO, OpenGraph & Social Cards</h2>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-white/20 backdrop-blur-md text-white border border-white/30">
              Live Meta Injection
            </span>
          </div>
          <p className="text-xs text-white/80 mt-0.5">
            Customize how your profile appears in search engines and when shared on Twitter, WhatsApp, and LinkedIn.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={openAiModal}
            className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold text-xs rounded-xl shadow transition-all flex items-center gap-1.5"
          >
            <Sparkles className="w-4 h-4 text-emerald-300" />
            <span>AI Copy</span>
          </button>

          <button
            type="button"
            onClick={() => handleManualSave()}
            disabled={isSaving}
            className="px-3.5 py-2 bg-white text-emerald-800 hover:bg-emerald-50 font-bold text-xs rounded-xl shadow transition-all flex items-center gap-1.5 disabled:opacity-50"
          >
            {isSaving ? (
              <RefreshCw className="w-4 h-4 animate-spin text-emerald-600" />
            ) : saveSuccess ? (
              <Check className="w-4 h-4 text-emerald-600" />
            ) : (
              <Save className="w-4 h-4 text-emerald-600" />
            )}
            <span>{saveSuccess ? 'Saved to Cloud!' : isSaving ? 'Saving...' : 'Save to Cloud'}</span>
          </button>
        </div>
      </div>

      {/* Cloud Sync Status Notification */}
      {saveSuccess && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl flex items-center gap-2 text-xs text-emerald-800 dark:text-emerald-300 animate-fade-in">
          <Check className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>
            Preferências de SEO e OpenGraph gravadas com sucesso no documento Firestore do usuário (<strong>users/{currentUser?.id}</strong>) e injetadas no cabeçalho HTML!
          </span>
        </div>
      )}

      {saveError && (
        <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-2xl flex items-center gap-2 text-xs text-rose-800 dark:text-rose-300 animate-fade-in">
          <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
          <span>{saveError}</span>
        </div>
      )}

      {/* SECTION 1: Meta Tags Configuration Form */}
      <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-4 shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Search className="w-4 h-4 text-emerald-500" />
              <span>Metadata & Open Graph Configuration</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              These values configure your HTML &lt;title&gt;, meta description, og:image, and Twitter card tags.
            </p>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Firestore Synced</span>
          </div>
        </div>

        <div className="space-y-4">
          {/* Meta Title */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <span>Meta Title</span>
                <span className="text-[10px] text-slate-400 font-normal">(&lt;title&gt; & og:title)</span>
              </label>
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                  isTitleOptimal
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                    : 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                }`}
              >
                {titleLength} / 60 chars {isTitleOptimal ? '✓' : '(aim for 30-60)'}
              </span>
            </div>
            <input
              type="text"
              value={seoSettings.metaTitle}
              onChange={(e) => updateSeoSettings({ metaTitle: e.target.value })}
              placeholder="e.g. Alex Rivera | Product Designer & Digital Creator"
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
            />
          </div>

          {/* Meta Description */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <span>Meta Description</span>
                <span className="text-[10px] text-slate-400 font-normal">(&lt;meta description&gt; & og:description)</span>
              </label>
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                  isDescOptimal
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                    : 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                }`}
              >
                {descLength} / 160 chars {isDescOptimal ? '✓' : '(aim for 80-160)'}
              </span>
            </div>
            <textarea
              rows={3}
              value={seoSettings.metaDescription}
              onChange={(e) => updateSeoSettings({ metaDescription: e.target.value })}
              placeholder="e.g. Official bio link for Alex Rivera. Download free UI resources, schedule consulting calls, and explore latest work."
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 leading-relaxed font-medium"
            />
          </div>

          {/* Social Share Image URL (og:image & twitter:image) */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-emerald-500" />
                <span>Social Share Banner Image URL</span>
                <span className="text-[10px] text-slate-400 font-normal">(og:image / twitter:image)</span>
              </label>
              <span className="text-[10px] text-slate-400 font-mono">Recommended ratio: 1.91 : 1 (1200x630)</span>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="url"
                value={seoSettings.ogImageUrl}
                onChange={(e) => updateSeoSettings({ ogImageUrl: e.target.value })}
                placeholder="https://images.unsplash.com/..."
                className="flex-1 px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
              />
              {seoSettings.ogImageUrl && (
                <div className="w-10 h-10 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 shrink-0 bg-slate-100 dark:bg-slate-800">
                  <img
                    src={seoSettings.ogImageUrl}
                    alt="Preview Thumbnail"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = profile.avatarUrl;
                    }}
                  />
                </div>
              )}
            </div>

            {/* Quick Share Image Presets */}
            <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/80">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                Quick Banner Presets:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {PRESET_SHARE_IMAGES.map((preset, idx) => {
                  const targetUrl = preset.url || profile.avatarUrl;
                  const isSelected = seoSettings.ogImageUrl === targetUrl;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectPresetImage(preset.url)}
                      className={`p-2 rounded-xl text-left border transition-all ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30'
                      }`}
                    >
                      <div className="text-[11px] font-bold text-slate-900 dark:text-white truncate flex items-center justify-between">
                        <span>{preset.label}</span>
                        {isSelected && <Check className="w-3 h-3 text-emerald-500 shrink-0" />}
                      </div>
                      <span className="text-[10px] text-slate-400 block truncate">{preset.desc}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Keywords Tagging */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Search Keywords (Comma Separated)
            </label>
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="text"
                value={seoSettings.keywords || ''}
                onChange={(e) => updateSeoSettings({ keywords: e.target.value })}
                placeholder="link in bio, digital creator, portfolio, consulting, web designer"
                className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: Interactive Social Media Card Preview Component (Twitter & WhatsApp) */}
      <SocialSharePreview
        seoSettings={seoSettings}
        profile={profile}
        publicUrl={publicUrl}
      />

      {/* SECTION 3: WhatsApp Sales Greeting Configuration */}
      <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-emerald-500 text-white shadow-md shadow-emerald-500/20">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Direct WhatsApp Sales Button
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Let visitors start a WhatsApp chat with your pre-formatted greeting message.
              </p>
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={profile.enableWhatsappButton}
              onChange={(e) => updateProfile({ enableWhatsappButton: e.target.checked })}
              className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
            />
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Enabled</span>
          </label>
        </div>

        {profile.enableWhatsappButton && (
          <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                WhatsApp Phone Number (with country code)
              </label>
              <input
                type="text"
                value={profile.whatsappNumber || ''}
                onChange={(e) => updateProfile({ whatsappNumber: e.target.value })}
                placeholder="e.g. +258841234567"
                className="w-full px-3.5 py-2 text-xs font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Pre-formatted Greeting Message
              </label>
              <textarea
                rows={2}
                value={profile.whatsappWelcomeMessage || ''}
                onChange={(e) => updateProfile({ whatsappWelcomeMessage: e.target.value })}
                placeholder="e.g. Hello! I saw your link on OmniLink and want to buy..."
                className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
