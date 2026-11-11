import React, { useState } from 'react';
import { Profile, LinkItem, Testimonial } from '../types';
import { SocialProofCarousel } from './SocialProofCarousel';
import { LeadCaptureForm } from './LeadCaptureForm';
import { useOmniLink } from '../context/OmniLinkContext';
import {
  Instagram,
  Twitter,
  Youtube,
  Linkedin,
  Send,
  Sparkles,
  Crown,
  Share2,
  ExternalLink,
  Check,
  CheckCircle2,
  Play,
  Mail,
  Coffee,
  MessageCircle,
  MousePointerClick,
  Image as ImageIcon,
  Sun,
} from 'lucide-react';

interface MobileMockupProps {
  profile: Profile;
  links: LinkItem[];
  testimonials: Testimonial[];
  onLinkClick?: (id: string) => void;
  onLeadSubmit?: (email: string, name?: string) => Promise<boolean> | void;
  onUpgradeClick?: () => void;
  isStandalonePublic?: boolean;
  showBezel?: boolean;
}

export const MobileMockup: React.FC<MobileMockupProps> = ({
  profile,
  links,
  testimonials,
  onLinkClick,
  onLeadSubmit,
  onUpgradeClick,
  isStandalonePublic = false,
  showBezel = true,
}) => {
  const { openTipJarModal, getPublicUrl } = useOmniLink();

  const [emailInput, setEmailInput] = useState('');
  const [leadSuccess, setLeadSuccess] = useState(false);
  const [leadSubmitting, setLeadSubmitting] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [clickNotice, setClickNotice] = useState<string | null>(null);

  const activeLinks = links.filter((l) => l.active);
  const publicShareUrl = getPublicUrl(profile.username);

  const handleLinkButtonClick = (e: React.MouseEvent, link: LinkItem) => {
    e.preventDefault();

    if (onLinkClick) {
      onLinkClick(link.id);
    }

    setClickNotice(`⚡ Click Tracked +1! Opening ${link.title}...`);
    setTimeout(() => setClickNotice(null), 2500);

    if (link.url) {
      const targetUrl = link.url.startsWith('http') ? link.url : `https://${link.url}`;
      window.open(targetUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput || !emailInput.includes('@')) return;
    setLeadSubmitting(true);
    if (onLeadSubmit) {
      const res = await onLeadSubmit(emailInput);
      if (res) {
        setLeadSuccess(true);
        setEmailInput('');
        setTimeout(() => setLeadSuccess(false), 4000);
      }
    } else {
      setLeadSuccess(true);
      setEmailInput('');
      setTimeout(() => setLeadSuccess(false), 4000);
    }
    setLeadSubmitting(false);
  };

  const handleCopyShare = () => {
    navigator.clipboard.writeText(publicShareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
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

  const getButtonStyle = (isHighlighted?: boolean) => {
    switch (profile.buttonStyle) {
      case 'outline':
        return 'bg-transparent border-2 border-white/30 hover:border-white text-white backdrop-blur-sm';
      case 'glass':
        return 'bg-white/10 hover:bg-white/20 border border-white/20 text-white backdrop-blur-md shadow-lg shadow-black/10';
      case 'shadow':
        return 'bg-white text-slate-900 hover:bg-slate-100 shadow-xl shadow-violet-500/10 font-bold';
      default:
        return isHighlighted
          ? 'bg-gradient-to-r from-violet-600 via-indigo-600 to-emerald-500 text-white font-bold shadow-lg shadow-violet-500/25 border border-white/20'
          : 'bg-white/15 hover:bg-white/25 border border-white/15 text-white backdrop-blur-sm';
    }
  };

  const whatsappUrl = `https://wa.me/${(profile.whatsappNumber || '').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
    profile.whatsappWelcomeMessage || 'Hello!'
  )}`;

  const getYouTubeEmbedId = (url?: string) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const youtubeEmbedId = getYouTubeEmbedId(profile.featuredVideoUrl);

  const renderBioContent = () => (
    <>
      {/* Click Toast Overlay Notice */}
      {clickNotice && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-slate-900 text-white text-xs font-extrabold rounded-full border border-violet-500 shadow-2xl animate-bounce flex items-center gap-1.5 whitespace-nowrap">
          <MousePointerClick className="w-4 h-4 text-amber-400" />
          <span>{clickNotice}</span>
        </div>
      )}

      {/* Top Profile Action Bar */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-1.5">
          <span
            onClick={handleCopyShare}
            className="text-xs font-mono tracking-tight text-white/60 hover:text-white truncate max-w-[180px] cursor-pointer"
            title="Click to copy public link"
          >
            ?u={profile.username}
          </span>
          {profile.customDomain && (
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-[9px] border border-emerald-500/30">
              {profile.customDomain}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Public Page Theme Mode Badge */}
          <span
            className="px-2 py-0.5 rounded-full bg-white/10 text-white/80 font-bold text-[10px] flex items-center gap-1 cursor-default"
            title={`Theme Mode: ${profile.bioThemeMode || 'auto'}`}
          >
            <Sun className="w-3 h-3 text-amber-300" />
            <span className="capitalize">{profile.bioThemeMode || 'Auto'}</span>
          </span>

          <button
            onClick={handleCopyShare}
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs transition-colors flex items-center gap-1 shrink-0"
            title="Share profile link"
          >
            {copiedLink ? (
              <Check className="w-4 h-4 text-emerald-400" />
            ) : (
              <Share2 className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Profile Avatar & Bio Section */}
      <div className="flex flex-col items-center text-center mb-6">
        <div className="relative mb-3">
          <img
            src={profile.avatarUrl}
            alt={profile.displayName}
            className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover ring-4 ring-white/20 shadow-2xl"
            onError={(e) => {
              e.currentTarget.src =
                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200';
            }}
          />
          {profile.isPro && (
            <div
              className="absolute bottom-0 right-0 p-1.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full ring-2 ring-slate-900 shadow"
              title="Pro Verified"
            >
              <Crown className="w-3.5 h-3.5" />
            </div>
          )}
        </div>

        <div className="flex items-center justify-center gap-1.5 mb-1.5">
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            {profile.displayName}
          </h1>
          {profile.isPro && (
            <CheckCircle2 className="w-5 h-5 text-blue-400 fill-blue-400/20" />
          )}
        </div>

        <p className="text-xs sm:text-sm text-white/80 max-w-sm leading-relaxed font-normal">
          {profile.bio}
        </p>

        {/* Direct WhatsApp Sales Action Button */}
        {profile.enableWhatsappButton && (
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-3.5 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-xs sm:text-sm rounded-full shadow-lg shadow-emerald-500/25 transition-all flex items-center gap-2 transform hover:scale-105"
          >
            <MessageCircle className="w-4 h-4 fill-white" />
            <span>Chat on WhatsApp</span>
          </a>
        )}

        {/* Social Links Row */}
        {profile.socialLinks && (
          <div className="flex items-center justify-center gap-3.5 mt-4">
            {profile.socialLinks.instagram && (
              <a
                href={profile.socialLinks.instagram}
                target="_blank"
                rel="noreferrer"
                className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white/90 hover:text-white transition-colors"
              >
                <Instagram className="w-4 h-4" />
              </a>
            )}
            {profile.socialLinks.twitter && (
              <a
                href={profile.socialLinks.twitter}
                target="_blank"
                rel="noreferrer"
                className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white/90 hover:text-white transition-colors"
              >
                <Twitter className="w-4 h-4" />
              </a>
            )}
            {profile.socialLinks.youtube && (
              <a
                href={profile.socialLinks.youtube}
                target="_blank"
                rel="noreferrer"
                className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white/90 hover:text-white transition-colors"
              >
                <Youtube className="w-4 h-4" />
              </a>
            )}
            {profile.socialLinks.linkedin && (
              <a
                href={profile.socialLinks.linkedin}
                target="_blank"
                rel="noreferrer"
                className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white/90 hover:text-white transition-colors"
              >
                <Linkedin className="w-4 h-4" />
              </a>
            )}
          </div>
        )}
      </div>

      {/* Links Buttons List */}
      <div className="space-y-3.5 mb-6">
        {activeLinks.map((link) => (
          <button
            key={link.id}
            type="button"
            onClick={(e) => handleLinkButtonClick(e, link)}
            className={`group w-full py-3.5 px-4 sm:px-5 rounded-2xl flex items-center justify-between text-xs sm:text-sm font-semibold transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] ${getButtonStyle(
              link.isHighlighted
            )} ${link.animation === 'pulse' ? 'animate-pulse' : ''}`}
          >
            <div className="flex items-center gap-3 truncate">
              <Sparkles className="w-4 h-4 text-amber-300 shrink-0" />
              <span className="truncate">{link.title}</span>
            </div>
            <ExternalLink className="w-4 h-4 opacity-60 group-hover:opacity-100 shrink-0" />
          </button>
        ))}
      </div>

      {/* Product / Portfolio Photo Showcase Gallery */}
      {(profile.galleryPhotos || []).length > 0 && (
        <div className="mb-6 space-y-2.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-white/90 px-1">
            <ImageIcon className="w-4 h-4 text-pink-400" />
            <span>{profile.galleryHeadline || 'Products & Portfolio'}</span>
          </div>

          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none snap-x">
            {profile.galleryPhotos.map((photo) => (
              <div
                key={photo.id}
                onClick={() => {
                  if (photo.linkUrl) {
                    window.open(photo.linkUrl, '_blank', 'noopener,noreferrer');
                  }
                }}
                className="flex-none w-48 bg-white/10 border border-white/15 rounded-2xl overflow-hidden backdrop-blur-md snap-start cursor-pointer hover:border-white/40 transition-colors"
              >
                <div className="relative aspect-video overflow-hidden">
                  <img
                    src={photo.imageUrl}
                    alt={photo.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src =
                        'https://images.unsplash.com/photo-1512290900673-3e13d9646b9a?w=400';
                    }}
                  />
                  {photo.priceCaption && (
                    <span className="absolute top-2 right-2 px-2 py-0.5 rounded bg-black/70 text-amber-300 font-mono font-bold text-[10px]">
                      {photo.priceCaption}
                    </span>
                  )}
                </div>
                <div className="p-2.5">
                  <h4 className="text-xs font-bold text-white truncate">{photo.title}</h4>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Featured Video Player Embed */}
      {profile.featuredVideoUrl && (
        <div className="mb-6 rounded-2xl overflow-hidden border border-white/20 bg-black/60 shadow-xl">
          {youtubeEmbedId ? (
            <div className="aspect-video w-full">
              <iframe
                src={`https://www.youtube.com/embed/${youtubeEmbedId}`}
                title="Featured Video"
                className="w-full h-full rounded-2xl"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : (
            <a
              href={profile.featuredVideoUrl}
              target="_blank"
              rel="noreferrer"
              className="relative aspect-video rounded-2xl bg-slate-950 flex items-center justify-center group cursor-pointer overflow-hidden block"
            >
              <div
                className="absolute inset-0 bg-cover bg-center opacity-60"
                style={{
                  backgroundImage: `url(https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500)`,
                }}
              />
              <div className="w-12 h-12 rounded-full bg-pink-600 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform z-10">
                <Play className="w-6 h-6 fill-white ml-0.5" />
              </div>
              <span className="absolute bottom-2 left-2 text-[10px] font-bold text-white bg-black/60 px-2.5 py-0.5 rounded backdrop-blur-md z-10">
                Watch Featured Reel
              </span>
            </a>
          )}
        </div>
      )}

      {/* Tip Jar / Support Creator Button */}
      {profile.enableTipJar && (
        <div className="mb-6">
          <button
            onClick={openTipJarModal}
            className="w-full py-3.5 px-4 sm:px-5 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white font-extrabold text-xs sm:text-sm shadow-lg shadow-amber-500/20 transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-2">
              <Coffee className="w-4.5 h-4.5 text-amber-200" />
              <span>{profile.tipJarHeadline || 'Support Creator / Tip'}</span>
            </div>
            <span className="px-2.5 py-0.5 rounded bg-black/20 text-[10px] uppercase font-bold text-white">
              Trywalled Pay
            </span>
          </button>
        </div>
      )}

      {/* Social Proof Testimonials Carousel (Controlled by enableTestimonials toggle) */}
      {profile.enableTestimonials !== false && (
        <div className="mb-6">
          <SocialProofCarousel
            testimonials={testimonials}
            userId={profile.userId || profile.id}
            username={profile.username}
            theme={profile.theme}
          />
        </div>
      )}

      {/* Lead Capture Email & Name Form (Controlled by enableLeadForm toggle) */}
      {profile.enableLeadForm !== false && profile.leadFormHeadline && (
        <div className="mb-6">
          <LeadCaptureForm
            userId={profile.userId || profile.id}
            profileUsername={profile.username}
            headline={profile.leadFormHeadline}
            buttonText={profile.leadFormButtonText}
            theme={profile.theme}
            showNameField={true}
            onSuccess={(lead) => {
              if (onLeadSubmit) {
                onLeadSubmit(lead.email, lead.name);
              }
            }}
          />
        </div>
      )}

      {/* Watermark Footer */}
      {profile.showWatermark && (
        <div className="pt-4 pb-2 text-center border-t border-white/10">
          <button
            onClick={onUpgradeClick}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/30 hover:bg-black/50 text-[10px] font-medium text-white/70 hover:text-white transition-colors"
          >
            <span>Powered by</span>
            <span className="font-extrabold text-white">OmniLink</span>
            <Crown className="w-3 h-3 text-amber-400 ml-0.5" />
          </button>
        </div>
      )}
    </>
  );

  // If bezel disabled (standalone public bio mode), render clean bezel-free container!
  if (!showBezel || isStandalonePublic) {
    return (
      <div className={`w-full max-w-md mx-auto rounded-3xl p-4 sm:p-6 ${getThemeBackground()} transition-all duration-300 shadow-2xl border border-white/10`}>
        {renderBioContent()}
      </div>
    );
  }

  // Dashboard Phone Shell Frame
  return (
    <div className="relative w-full max-w-[340px] mx-auto">
      <div className="relative rounded-[42px] p-3 border-4 border-slate-800 dark:border-slate-700 bg-slate-900 phone-mockup-shadow transition-all duration-300">
        <div className="absolute top-5 left-1/2 -translate-x-1/2 z-30 w-24 h-4 bg-black rounded-full flex items-center justify-center gap-1.5 px-2">
          <div className="w-2 h-2 rounded-full bg-slate-900 ring-1 ring-slate-800" />
          <div className="w-2 h-2 rounded-full bg-blue-900/40" />
        </div>

        <div
          className={`relative w-full min-h-[640px] max-h-[760px] overflow-y-auto rounded-[32px] pt-8 pb-6 px-4 ${getThemeBackground()} transition-all duration-500 scrollbar-none`}
        >
          {renderBioContent()}
        </div>
      </div>
    </div>
  );
};
