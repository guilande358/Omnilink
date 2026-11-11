import React from 'react';
import { useOmniLink } from '../context/OmniLinkContext';
import { CheckCircle2, AlertCircle, XCircle, ExternalLink, X, ShieldCheck, Crown } from 'lucide-react';

export const BillingCallbackBanner: React.FC = () => {
  const { billingCallbackNotification, clearBillingNotification, openTrywalledModal } = useOmniLink();

  if (!billingCallbackNotification) return null;

  const { type, message, billingSupportUrl } = billingCallbackNotification;

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[60] w-full max-w-xl px-4 animate-bounce-short">
      <div
        className={`relative p-4 rounded-2xl shadow-2xl border backdrop-blur-md transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
          type === 'success'
            ? 'bg-emerald-950/90 border-emerald-500/50 text-emerald-100 ring-4 ring-emerald-500/20'
            : type === 'cancel'
            ? 'bg-amber-950/90 border-amber-500/50 text-amber-100 ring-4 ring-amber-500/20'
            : type === 'info'
            ? 'bg-violet-950/90 border-violet-500/50 text-violet-100 ring-4 ring-violet-500/20'
            : 'bg-rose-950/90 border-rose-500/50 text-rose-100 ring-4 ring-rose-500/20'
        }`}
      >
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl shrink-0 mt-0.5 sm:mt-0">
            {type === 'success' && <CheckCircle2 className="w-6 h-6 text-emerald-400" />}
            {type === 'cancel' && <AlertCircle className="w-6 h-6 text-amber-400" />}
            {type === 'info' && <ShieldCheck className="w-6 h-6 text-violet-400 animate-pulse" />}
            {type === 'error' && <XCircle className="w-6 h-6 text-rose-400" />}
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xs uppercase tracking-wider flex items-center gap-1">
                {type === 'success' && (
                  <>
                    <Crown className="w-3.5 h-3.5 text-amber-300" />
                    <span>OmniLink Pro Confirmado</span>
                  </>
                )}
                {type === 'cancel' && <span>Checkout Cancelado</span>}
                {type === 'info' && <span>Verificando Assinatura</span>}
                {type === 'error' && <span>Confirmação Pendente</span>}
              </span>
            </div>

            <p className="text-xs font-medium leading-relaxed">{message}</p>

            {billingSupportUrl && (
              <div className="pt-1">
                <a
                  href={billingSupportUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-300 hover:text-emerald-200 underline"
                >
                  <span>Acessar Suporte de Cobrança Walled</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
          {type === 'success' && (
            <button
              onClick={openTrywalledModal}
              className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold text-xs rounded-xl transition-all shadow"
            >
              Ver Detalhes Pro
            </button>
          )}

          <button
            onClick={clearBillingNotification}
            className="p-1.5 rounded-lg hover:bg-white/10 text-white/80 hover:text-white transition-colors"
            aria-label="Fechar notificação"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
