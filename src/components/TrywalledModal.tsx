import React, { useState } from 'react';
import { useOmniLink } from '../context/OmniLinkContext';
import {
  X,
  Check,
  Crown,
  Sparkles,
  ShieldCheck,
  Zap,
  BarChart3,
  RefreshCw,
  Globe,
  ExternalLink,
  AlertTriangle,
} from 'lucide-react';

export const TrywalledModal: React.FC = () => {
  const { isTrywalledModalOpen, closeTrywalledModal, profile, downgradeToFree, currentUser, openAuthModal } =
    useOmniLink();

  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [requiresDomainSetup, setRequiresDomainSetup] = useState(false);

  if (!isTrywalledModalOpen) return null;

  const handleWalledProCheckout = async () => {
    setIsProcessing(true);
    setErrorMsg('');
    setRequiresDomainSetup(false);

    // DIRECTIVE 2: customerRef must be strictly the authenticated user's unique Firebase UID
    if (!currentUser?.id) {
      setIsProcessing(false);
      setErrorMsg('Por favor, faça login ou crie uma conta para vincular a assinatura Pro ao seu perfil.');
      openAuthModal();
      return;
    }

    const customerRef = currentUser.id;

    // DIRECTIVE 3: Fresh UUID v4 generated on each click for idempotency
    const attemptId = typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
          const r = (Math.random() * 16) | 0;
          const v = c === 'x' ? r : (r & 0x3) | 0x8;
          return v.toString(16);
        });

    try {
      const res = await fetch('/api/walled/checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${customerRef}`,
        },
        body: JSON.stringify({
          customerRef,
          attemptId,
        }),
      });

      const data = await res.json();
      setIsProcessing(false);

      const targetCheckoutUrl = data.checkoutUrl || data.url || data.sessionUrl;

      if (data.success && targetCheckoutUrl) {
        // Redirecionamento completo do usuário para o checkout hospedado seguro do Trywalled
        window.location.href = targetCheckoutUrl;
      } else {
        if (data.requiresDomainConfig || (data.error && data.error.toLowerCase().includes('domínio'))) {
          setRequiresDomainSetup(true);
        }
        setErrorMsg(data.error || 'Não foi possível iniciar a sessão de checkout. Tente novamente.');
      }
    } catch (err: any) {
      setIsProcessing(false);
      setErrorMsg('Erro de conexão ao iniciar o checkout seguro. Verifique sua rede e tente novamente.');
    }
  };

  const handleDowngrade = () => {
    downgradeToFree();
    closeTrywalledModal();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
        {/* Top Header Banner */}
        <div className="relative bg-gradient-to-r from-violet-600 via-indigo-600 to-amber-500 p-6 text-white overflow-hidden">
          <button
            onClick={closeTrywalledModal}
            className="absolute top-4 right-4 p-2 rounded-full bg-black/20 hover:bg-black/40 text-white transition-colors focus:outline-none"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wider uppercase bg-white/20 backdrop-blur-md text-white border border-white/30 flex items-center gap-1">
              <Crown className="w-3.5 h-3.5 text-amber-300" />
              <span>OmniLink Pro</span>
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-400 text-slate-950">
              Trywalled Hosted Checkout
            </span>
          </div>

          <h2 className="text-2xl font-extrabold tracking-tight text-white mb-1">
            Plano OmniLink Pro
          </h2>
          <p className="text-xs text-white/90 max-w-sm">
            Remova a marca d'água, conecte seu domínio personalizado CNAME e libere analytics avançados de conversão.
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {/* User Account Verification Badge */}
          {currentUser ? (
            <div className="mb-4 p-2.5 bg-slate-100 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700/60 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 truncate">
                <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                <span className="truncate text-slate-700 dark:text-slate-300">
                  Assinando como: <strong className="text-slate-900 dark:text-white">{currentUser.email}</strong>
                </span>
              </div>
              <span className="text-[10px] font-mono bg-white dark:bg-slate-900 px-2 py-0.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-500 shrink-0">
                UID: {currentUser.id.substring(0, 8)}...
              </span>
            </div>
          ) : (
            <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-2xl flex items-center justify-between text-xs">
              <span className="text-amber-800 dark:text-amber-300 font-medium">
                Faça login para vincular a assinatura ao seu perfil
              </span>
              <button
                type="button"
                onClick={() => {
                  closeTrywalledModal();
                  openAuthModal();
                }}
                className="px-2.5 py-1 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-lg text-xs transition-colors shrink-0"
              >
                Entrar
              </button>
            </div>
          )}

          {/* Billing Cycle Toggle ($79/ano DESATIVADO) */}
          <div className="space-y-1 mb-5">
            <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
              Selecione o Plano de Assinatura
            </label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl">
              <button
                type="button"
                onClick={() => setBillingCycle('monthly')}
                className={`py-2.5 px-3 text-xs font-extrabold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                  billingCycle === 'monthly'
                    ? 'bg-white dark:bg-slate-900 text-violet-600 dark:text-violet-400 shadow-sm'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                <span>Mensal ($9 / mês)</span>
              </button>

              <button
                type="button"
                disabled
                className="py-2.5 px-3 text-xs font-bold rounded-xl bg-slate-200/50 dark:bg-slate-800/30 text-slate-400 dark:text-slate-500 cursor-not-allowed flex flex-col items-center justify-center opacity-70"
                title="Plano Anual ainda não configurado"
              >
                <span>Anual ($79 / ano)</span>
                <span className="text-[9px] font-extrabold uppercase text-slate-400 dark:text-slate-500">
                  Desativado (Em Breve)
                </span>
              </button>
            </div>
          </div>

          {/* Feature Checklist */}
          <div className="space-y-2.5 mb-6 text-xs text-slate-700 dark:text-slate-300">
            <div className="flex items-center gap-2.5">
              <div className="p-1 rounded-md bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 shrink-0">
                <Check className="w-3.5 h-3.5" />
              </div>
              <span className="font-semibold text-slate-900 dark:text-white">
                Remover Marca d'Água "Powered by OmniLink"
              </span>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="p-1 rounded-md bg-violet-100 dark:bg-violet-900/50 text-violet-600 dark:text-violet-400 shrink-0">
                <Globe className="w-3.5 h-3.5" />
              </div>
              <span>Mapeamento de Domínio Personalizado CNAME</span>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="p-1 rounded-md bg-violet-100 dark:bg-violet-900/50 text-violet-600 dark:text-violet-400 shrink-0">
                <BarChart3 className="w-3.5 h-3.5" />
              </div>
              <span>Analytics Detalhado de Cliques & Países</span>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="p-1 rounded-md bg-violet-100 dark:bg-violet-900/50 text-violet-600 dark:text-violet-400 shrink-0">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <span>Geração Ilimitada de Copy & Headlines com IA</span>
            </div>
          </div>

          {requiresDomainSetup && (
            <div className="p-3.5 mb-4 bg-amber-50 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-700/80 rounded-2xl text-xs space-y-2">
              <div className="font-extrabold flex items-center gap-1.5 text-amber-800 dark:text-amber-300">
                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                <span>Configuração de Domínio no Trywalled Necessária</span>
              </div>
              <p className="text-[11px] leading-relaxed text-slate-700 dark:text-slate-300">
                A API do Walled exige que o plano tenha ao menos um domínio autorizado nas configurações para permitir checkouts.
              </p>
              <div className="p-2 bg-white dark:bg-slate-900 rounded-xl border border-amber-200 dark:border-amber-800 font-mono text-[11px] text-slate-900 dark:text-slate-100 font-bold select-all">
                omnilinksbio.ai.studio
              </div>
              <p className="text-[10px] text-slate-600 dark:text-slate-400">
                No painel <strong>trywalled.com</strong>, edite o plano <strong>"Omnilink Smart Bio & Social Profiles"</strong>, adicione este domínio no campo <strong>Allowed Domains</strong> e salve.
              </p>
              <a
                href="https://trywalled.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 font-extrabold text-xs text-amber-700 dark:text-amber-300 hover:underline pt-0.5"
              >
                <span>Acessar Painel Trywalled (trywalled.com)</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}

          {errorMsg && !requiresDomainSetup && (
            <div className="p-3 mb-4 bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 rounded-xl text-xs font-medium">
              {errorMsg}
            </div>
          )}

          {/* Checkout Action Button - Strictly triggers server checkout session and redirects */}
          <button
            type="button"
            onClick={handleWalledProCheckout}
            disabled={isProcessing}
            className="w-full py-3.5 px-4 bg-gradient-to-r from-violet-600 via-indigo-600 to-amber-500 hover:from-violet-700 hover:to-indigo-700 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-violet-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isProcessing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-white" />
                <span>Iniciando Checkout Seguro...</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 text-amber-200" />
                <span>Assinar OmniLink Pro ($9 / mês)</span>
              </>
            )}
          </button>

          <div className="mt-3 text-center">
            <span className="text-[10px] text-slate-400 dark:text-slate-500 flex items-center justify-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              Checkout Hospedado Criptografado no Trywalled • Renovação Automática Cancelável
            </span>
          </div>

          {profile.isPro && (
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-center space-y-3">
              <div className="p-3 bg-violet-50 dark:bg-violet-950/50 rounded-2xl border border-violet-200 dark:border-violet-800 text-left">
                <div className="flex items-center gap-2 text-violet-700 dark:text-violet-300 font-extrabold text-xs mb-1">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span>Assinatura Pro Ativa (Walled Verified)</span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400">
                  Para comprovantes de pagamento ou cancelamento oficial:
                </p>
                <a
                  href={profile.billingSupportUrl || 'https://trywalled.com/en/docs/integrations'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1.5 inline-flex items-center gap-1.5 text-xs font-bold text-violet-600 dark:text-violet-400 hover:text-violet-700 underline"
                >
                  <span>Acessar Suporte de Cobrança Walled</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              <button
                onClick={handleDowngrade}
                className="text-xs text-rose-500 hover:text-rose-600 underline font-medium"
              >
                Voltar para o Plano Gratuito
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
