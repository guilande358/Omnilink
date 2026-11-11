import React, { useState } from 'react';
import { useOmniLink } from '../context/OmniLinkContext';
import { Coffee, Heart, X, CheckCircle2, ShieldCheck, Wallet, QrCode, Copy, Check, ExternalLink, Sparkles } from 'lucide-react';

export const TipJarModal: React.FC = () => {
  const { isTipJarModalOpen, closeTipJarModal, profile, submitTip } = useOmniLink();

  const [paymentMethod, setPaymentMethod] = useState<'trywalled' | 'pix'>('trywalled');

  const isMzn = profile.tipJarCurrency === 'MZN';
  const presets = paymentMethod === 'pix' ? [10, 25, 50, 100] : isMzn ? [100, 250, 500, 1000] : [3, 5, 10, 25];
  const currencySymbol = paymentMethod === 'pix' ? 'R$' : isMzn ? 'MT' : '$';

  const [selectedAmount, setSelectedAmount] = useState<number>(presets[1]);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [supporterName, setSupporterName] = useState('');
  const [message, setMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Pix specific states
  const [pixCopied, setPixCopied] = useState(false);
  const pixKey = `00020126580014br.gov.bcb.pix0136pix-${profile.username}-omnilink-tip-key5204000053039865405${selectedAmount}.005802BR5920OmniLink Creator6009SAO PAULO62070503***6304E21A`;

  if (!isTipJarModalOpen) return null;

  const finalAmount = customAmount ? parseFloat(customAmount) : selectedAmount;

  const handleCopyPix = () => {
    navigator.clipboard.writeText(pixKey);
    setPixCopied(true);
    setTimeout(() => setPixCopied(false), 2500);
  };

  const handleProcessDonation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!finalAmount || finalAmount <= 0) return;

    setIsProcessing(true);
    const currency = paymentMethod === 'pix' ? 'BRL' : isMzn ? 'MZN' : 'USD';

    try {
      const res = await submitTip(finalAmount, currency, supporterName, message);
      setIsProcessing(false);

      if (res) {
        setIsSuccess(true);
        setTimeout(() => {
          setIsSuccess(false);
          closeTipJarModal();
        }, 3000);
      }
    } catch (err) {
      setIsProcessing(false);
      console.error('Donation error:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
        {/* Banner Header */}
        <div className="p-6 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white relative">
          <button
            onClick={closeTipJarModal}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-black/20 hover:bg-black/40 text-white transition-colors"
            aria-label="Fechar"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <span className="p-2 rounded-xl bg-white/20 backdrop-blur-md text-white">
              <Coffee className="w-5 h-5" />
            </span>
            <span className="text-[11px] font-bold uppercase tracking-wider bg-white/20 px-2.5 py-0.5 rounded-full border border-white/30">
              Apoiar Criador
            </span>
          </div>

          <h3 className="text-xl font-extrabold text-white">
            {profile.tipJarHeadline || 'Apoie o meu trabalho'}
          </h3>
          <p className="text-xs text-white/90 mt-1">
            Envie uma doação direta e segura via Trywalled Hosted Gateway ou Pix (Brasil).
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4">
          {isSuccess ? (
            <div className="py-8 text-center space-y-3">
              <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto ring-8 ring-emerald-50 dark:ring-emerald-900/30 animate-bounce">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                Obrigado pelo apoio! 🎉
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Sua contribuição de {currencySymbol} {finalAmount} para @{profile.username} foi registrada com sucesso!
              </p>
            </div>
          ) : (
            <form onSubmit={handleProcessDonation} className="space-y-4">
              {/* Payment Gateway Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Forma de Pagamento
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('trywalled')}
                    className={`py-2.5 px-3 text-xs font-bold rounded-xl border flex items-center justify-center gap-2 transition-all ${
                      paymentMethod === 'trywalled'
                        ? 'bg-amber-500 text-white border-amber-500 shadow-md shadow-amber-500/20'
                        : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <Wallet className="w-4 h-4" />
                    <span>Trywalled Gateway</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('pix')}
                    className={`py-2.5 px-3 text-xs font-bold rounded-xl border flex items-center justify-center gap-2 transition-all ${
                      paymentMethod === 'pix'
                        ? 'bg-teal-600 text-white border-teal-600 shadow-md shadow-teal-500/20'
                        : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <QrCode className="w-4 h-4" />
                    <span>Pix (Brasil 🇧🇷)</span>
                  </button>
                </div>
              </div>

              {/* Amount Preset Grid */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Selecione o Valor ({paymentMethod === 'pix' ? 'BRL' : isMzn ? 'MZN' : 'USD'})
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {presets.map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => {
                        setSelectedAmount(val);
                        setCustomAmount('');
                      }}
                      className={`py-2 px-1 text-xs font-bold rounded-xl border transition-all ${
                        selectedAmount === val && !customAmount
                          ? 'bg-amber-500 text-white border-amber-500 shadow-md shadow-amber-500/20'
                          : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-amber-500'
                      }`}
                    >
                      {currencySymbol} {val}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom amount */}
              <div>
                <input
                  type="number"
                  min="1"
                  step="any"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  placeholder={`Ou digite outro valor em ${currencySymbol}...`}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Pix Copy and Paste Flow */}
              {paymentMethod === 'pix' && (
                <div className="p-3 bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 rounded-2xl space-y-2 text-center">
                  <div className="flex items-center justify-between text-xs font-bold text-teal-800 dark:text-teal-300">
                    <span>Chave Pix Copia e Cola</span>
                    <span className="text-[10px] bg-teal-200 dark:bg-teal-900 px-2 py-0.5 rounded">Instantâneo</span>
                  </div>
                  <div className="p-2 bg-white dark:bg-slate-900 rounded-xl border border-teal-200 dark:border-teal-800 text-[10px] font-mono break-all text-slate-600 dark:text-slate-300 select-all">
                    {pixKey}
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyPix}
                    className="w-full py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5"
                  >
                    {pixCopied ? <Check className="w-4 h-4 text-amber-300" /> : <Copy className="w-4 h-4" />}
                    <span>{pixCopied ? 'Chave Pix Copiada!' : 'Copiar Chave Pix'}</span>
                  </button>
                </div>
              )}

              {/* Trywalled Hosted Security Banner (No local credit card fields) */}
              {paymentMethod === 'trywalled' && (
                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    <span>Trywalled Hosted Checkout Seguro</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Transações processadas via gateway criptografado 256-bit SSL. Nenhum dado de cartão de crédito é retido ou digitado no frontend do OmniLink.
                  </p>
                </div>
              )}

              {/* Supporter details */}
              <div className="space-y-2">
                <input
                  type="text"
                  value={supporterName}
                  onChange={(e) => setSupporterName(e.target.value)}
                  placeholder="Seu Nome (Opcional)"
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                <textarea
                  rows={2}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Mensagem de carinho para o criador..."
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Security info */}
              <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1.5 font-medium">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  {paymentMethod === 'pix' ? 'Pix Banco Central do Brasil' : 'Trywalled Gateway Oficial'}
                </span>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                  Checkout Criptografado
                </span>
              </div>

              <button
                type="submit"
                disabled={isProcessing}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isProcessing ? (
                  <span>Processando Doação...</span>
                ) : (
                  <>
                    <Heart className="w-4 h-4 fill-white" />
                    <span>Enviar Doação de {currencySymbol} {finalAmount}</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
