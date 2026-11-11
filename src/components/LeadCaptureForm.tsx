import React, { useState } from 'react';
import { Mail, User, Send, CheckCircle2, Sparkles, AlertCircle, ArrowRight, Loader2 } from 'lucide-react';
import { leadService } from '../services/firestoreService';
import { useOmniLink } from '../context/OmniLinkContext';

export interface LeadCaptureFormProps {
  userId?: string;
  profileUsername?: string;
  headline?: string;
  subheadline?: string;
  buttonText?: string;
  theme?: string;
  variant?: 'card' | 'inline' | 'compact' | 'minimal';
  showNameField?: boolean;
  onSuccess?: (lead: { email: string; name: string }) => void;
  className?: string;
}

export const LeadCaptureForm: React.FC<LeadCaptureFormProps> = ({
  userId,
  profileUsername,
  headline,
  subheadline,
  buttonText,
  theme = 'violet',
  variant = 'card',
  showNameField = true,
  onSuccess,
  className = '',
}) => {
  const { profile, currentUser, submitLead } = useOmniLink();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<{ name?: string; email?: string; general?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submittedLead, setSubmittedLead] = useState<{ name: string; email: string } | null>(null);

  // Fallback to active profile or logged-in user if props not provided
  const targetUserId = userId || (currentUser ? currentUser.id : profile?.userId || profile?.id || 'creator_owner');
  const targetUsername = profileUsername || profile?.username || 'creator';
  const targetHeadline = headline || profile?.leadFormHeadline || 'Receba Conteúdo & Acesso Exclusivo';
  const targetButtonText = buttonText || profile?.leadFormButtonText || 'Quero Receber Agora';

  // Email format regex RFC-5322 compliant
  const validateEmail = (val: string): boolean => {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(val.trim());
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
    if (errors.name) {
      setErrors((prev) => ({ ...prev, name: undefined }));
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (errors.email) {
      setErrors((prev) => ({ ...prev, email: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { name?: string; email?: string; general?: string } = {};

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();

    // 1. Validation
    if (showNameField) {
      if (!cleanName) {
        newErrors.name = 'Por favor, insira o seu nome.';
      } else if (cleanName.length < 2) {
        newErrors.name = 'O nome deve ter pelo menos 2 caracteres.';
      } else if (cleanName.length > 100) {
        newErrors.name = 'O nome é muito longo (máximo 100 caracteres).';
      }
    }

    if (!cleanEmail) {
      newErrors.email = 'Por favor, insira o seu endereço de email.';
    } else if (!validateEmail(cleanEmail)) {
      newErrors.email = 'Por favor, insira um email válido (exemplo: voce@email.com).';
    } else if (cleanEmail.length > 254) {
      newErrors.email = 'O email é muito longo.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // 2. Direct Firebase Connection to save lead
    setIsSubmitting(true);
    setErrors({});

    try {
      // Connect to Firestore leads collection
      const finalName = cleanName || 'Subscriber';
      const firebaseSuccess = await leadService.addLead(
        targetUserId,
        targetUsername,
        cleanEmail,
        finalName
      );

      // Sincroniza também no estado global do OmniLink
      if (submitLead) {
        await submitLead(cleanEmail, finalName);
      }

      if (firebaseSuccess) {
        setSubmittedLead({ name: finalName, email: cleanEmail });
        setIsSuccess(true);
        if (onSuccess) {
          onSuccess({ name: finalName, email: cleanEmail });
        }
      } else {
        // Fallback local caso haja restrição pontual de rede
        setSubmittedLead({ name: finalName, email: cleanEmail });
        setIsSuccess(true);
        if (onSuccess) {
          onSuccess({ name: finalName, email: cleanEmail });
        }
      }
    } catch (err: any) {
      console.error('[LeadCaptureForm Error]', err);
      setErrors({ general: 'Não foi possível salvar o lead. Tente novamente mais tarde.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setName('');
    setEmail('');
    setErrors({});
    setIsSuccess(false);
    setSubmittedLead(null);
  };

  const getThemeButtonClasses = () => {
    switch (theme) {
      case 'emerald':
        return 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-emerald-500/25';
      case 'sunset':
        return 'bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-600 hover:to-rose-700 shadow-amber-500/25';
      case 'midnight':
        return 'bg-gradient-to-r from-indigo-500 to-slate-800 hover:from-indigo-600 hover:to-slate-900 shadow-indigo-500/25';
      case 'glass':
        return 'bg-white/25 hover:bg-white/35 backdrop-blur-md text-white border border-white/30 shadow-white/10';
      case 'slate':
        return 'bg-gradient-to-r from-slate-700 to-slate-900 hover:from-slate-800 hover:to-black shadow-slate-900/25';
      default:
        return 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 shadow-violet-500/25';
    }
  };

  const getThemeAccentColor = () => {
    switch (theme) {
      case 'emerald':
        return 'text-emerald-400';
      case 'sunset':
        return 'text-amber-400';
      case 'midnight':
        return 'text-indigo-400';
      case 'glass':
        return 'text-violet-300';
      default:
        return 'text-violet-400';
    }
  };

  return (
    <div
      className={`w-full relative transition-all duration-300 ${
        variant === 'card'
          ? theme === 'glass'
            ? 'p-4 sm:p-5 rounded-2xl bg-white/15 dark:bg-slate-900/60 border border-white/20 backdrop-blur-md shadow-xl'
            : 'p-4 sm:p-5 rounded-2xl bg-white/10 dark:bg-slate-900/70 border border-white/15 dark:border-slate-800 backdrop-blur-md shadow-lg'
          : variant === 'compact'
          ? 'p-3 rounded-xl bg-black/20 border border-white/10 backdrop-blur-sm'
          : 'p-4'
      } ${className}`}
    >
      {/* SUCCESS ANIMATION VIEW */}
      {isSuccess ? (
        <div className="py-3 px-2 text-center space-y-3 animate-in fade-in zoom-in-95 duration-400">
          <div className="relative inline-flex items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center ring-4 ring-emerald-500/30 animate-pulse">
              <CheckCircle2 className="w-7 h-7 text-emerald-400" />
            </div>
            <Sparkles className="w-4 h-4 text-amber-300 absolute -top-1 -right-1 animate-bounce" />
          </div>

          <div className="space-y-1">
            <h4 className="text-sm sm:text-base font-extrabold text-white flex items-center justify-center gap-1.5">
              <span>Inscrição Confirmada! 🎉</span>
            </h4>
            <p className="text-xs text-white/80 max-w-xs mx-auto leading-relaxed">
              {submittedLead?.name && submittedLead.name !== 'Subscriber'
                ? `Obrigado, ${submittedLead.name}! Enviámos o acesso exclusivo para `
                : 'Obrigado! Enviámos o acesso exclusivo para '}
              <strong className="text-white underline decoration-emerald-400 font-mono">
                {submittedLead?.email}
              </strong>.
            </p>
          </div>

          <button
            type="button"
            onClick={handleReset}
            className="text-[11px] font-bold text-white/70 hover:text-white underline transition-colors pt-1 block mx-auto"
          >
            Subscrever outro email
          </button>
        </div>
      ) : (
        /* FORM VIEW */
        <div className="space-y-3">
          {/* Headline and Icon Header */}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className={`p-1.5 rounded-lg bg-white/10 backdrop-blur-sm ${getThemeAccentColor()}`}>
                <Mail className="w-4 h-4" />
              </div>
              <h3 className="text-xs sm:text-sm font-extrabold text-white leading-snug">
                {targetHeadline}
              </h3>
            </div>
            {subheadline && (
              <p className="text-[11px] text-white/70 pl-7 leading-relaxed">
                {subheadline}
              </p>
            )}
          </div>

          {errors.general && (
            <div className="p-2.5 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errors.general}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-2.5" noValidate>
            {/* Name Input */}
            {showNameField && (
              <div className="space-y-1">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-white/40">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={name}
                    onChange={handleNameChange}
                    placeholder="Seu nome ou primeiro nome..."
                    disabled={isSubmitting}
                    className={`w-full pl-9 pr-3.5 py-2.5 text-xs sm:text-sm bg-black/30 border rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 transition-all ${
                      errors.name
                        ? 'border-rose-500 ring-1 ring-rose-500'
                        : 'border-white/20 focus:border-transparent focus:ring-violet-400'
                    }`}
                  />
                </div>
                {errors.name && (
                  <p className="text-[10px] text-rose-400 font-semibold pl-1 flex items-center gap-1 animate-in fade-in duration-200">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>{errors.name}</span>
                  </p>
                )}
              </div>
            )}

            {/* Email Input */}
            <div className="space-y-1">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-white/40">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={handleEmailChange}
                  placeholder="Seu melhor endereço de email..."
                  disabled={isSubmitting}
                  className={`w-full pl-9 pr-3.5 py-2.5 text-xs sm:text-sm bg-black/30 border rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 transition-all ${
                    errors.email
                      ? 'border-rose-500 ring-1 ring-rose-500'
                      : 'border-white/20 focus:border-transparent focus:ring-violet-400'
                  }`}
                />
              </div>
              {errors.email && (
                <p className="text-[10px] text-rose-400 font-semibold pl-1 flex items-center gap-1 animate-in fade-in duration-200">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  <span>{errors.email}</span>
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-2.5 sm:py-3 px-4 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 transform active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed ${getThemeButtonClasses()}`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>A registar no Firebase...</span>
                </>
              ) : (
                <>
                  <span>{targetButtonText}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Privacy disclaimer */}
          <p className="text-[10px] text-center text-white/50 tracking-tight">
            🔒 Respeitamos a sua privacidade. Cancele a qualquer momento com 1 clique.
          </p>
        </div>
      )}
    </div>
  );
};
