import React, { useState } from 'react';
import { useOmniLink } from '../../context/OmniLinkContext';
import {
  MessageSquareQuote,
  Eye,
  EyeOff,
  Sparkles,
  Plus,
  Star,
  CheckCircle2,
  Trash2,
  ChevronRight,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { SocialProofCarousel } from '../SocialProofCarousel';

export const SocialProofWidget: React.FC = () => {
  const {
    profile,
    updateProfile,
    testimonials,
    addTestimonial,
    updateTestimonial,
    deleteTestimonial,
    currentUser,
  } = useOmniLink();

  // Testimonials visibility state (defaults to true if undefined)
  const isEnabled = profile.enableTestimonials !== false;

  const [isAddingReview, setIsAddingReview] = useState(false);
  const [clientName, setClientName] = useState('');
  const [clientRole, setClientRole] = useState('');
  const [clientAvatar, setClientAvatar] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [saveSuccessNotice, setSaveSuccessNotice] = useState(false);

  const handleToggleVisibility = async () => {
    const nextState = !isEnabled;
    await updateProfile({ enableTestimonials: nextState });
    setSaveSuccessNotice(true);
    setTimeout(() => setSaveSuccessNotice(false), 2500);
  };

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim() || !comment.trim()) return;

    addTestimonial({
      clientName: clientName.trim(),
      clientRole: clientRole.trim() || 'Verified Customer',
      clientAvatar:
        clientAvatar.trim() ||
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      rating,
      comment: comment.trim(),
      featured: true,
    });

    setClientName('');
    setClientRole('');
    setClientAvatar('');
    setRating(5);
    setComment('');
    setIsAddingReview(false);
    setSaveSuccessNotice(true);
    setTimeout(() => setSaveSuccessNotice(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Widget Header & Main Visibility Toggle Card */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 text-white shadow-xl shadow-emerald-500/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-white/20 backdrop-blur-md">
              <MessageSquareQuote className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-lg font-black tracking-tight text-white">
              Social Proof & Testimonials Widget
            </h2>
          </div>
          <p className="text-xs text-white/80 max-w-xl">
            Aumente a confiança dos visitantes exibindo depoimentos e avaliações reais de clientes em um carrossel na sua bio pública.
          </p>
        </div>

        {/* Global Visibility Switch Button */}
        <div className="flex items-center gap-3 bg-black/25 backdrop-blur-md p-2 rounded-2xl border border-white/20 shrink-0 self-stretch sm:self-auto justify-between sm:justify-start">
          <div className="flex items-center gap-2 pl-2">
            {isEnabled ? (
              <Eye className="w-4 h-4 text-emerald-300" />
            ) : (
              <EyeOff className="w-4 h-4 text-white/50" />
            )}
            <div className="text-left">
              <span className="block text-[11px] font-extrabold uppercase tracking-wider text-white">
                {isEnabled ? 'Visível na Bio' : 'Oculto na Bio'}
              </span>
              <span className="block text-[9px] text-white/70">
                {isEnabled ? 'Carrossel ativo no site' : 'Desativado na página pública'}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleToggleVisibility}
            className={`relative inline-flex h-7 w-13 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-slate-900 ${
              isEnabled ? 'bg-emerald-400' : 'bg-slate-700'
            }`}
            role="switch"
            aria-checked={isEnabled}
            title={isEnabled ? 'Clique para ocultar o carrossel na bio' : 'Clique para exibir o carrossel na bio'}
          >
            <span
              className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                isEnabled ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Save / Feedback Notification Toast */}
      {saveSuccessNotice && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs font-semibold text-emerald-800 dark:text-emerald-300 flex items-center gap-2 animate-in fade-in duration-200">
          <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>Preferência atualizada e salva no banco de dados Firestore!</span>
        </div>
      )}

      {/* Live Carousel Preview Card */}
      <div className="p-4 sm:p-5 bg-gradient-to-br from-slate-900 to-emerald-950 border border-emerald-900/50 rounded-2xl space-y-3 text-white shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
              <Eye className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Live Carousel Preview & Firestore Sync
              </h3>
              <p className="text-[11px] text-white/70">
                {isEnabled
                  ? 'O carrossel está visível e alternando depoimentos em tempo real.'
                  : '⚠️ O carrossel está oculto para visitantes da bio pública.'}
              </p>
            </div>
          </div>
          <span
            className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${
              isEnabled
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
            }`}
          >
            {isEnabled ? 'Visível ao Público' : 'Oculto'}
          </span>
        </div>

        <div className="max-w-md mx-auto pt-2">
          <SocialProofCarousel
            testimonials={testimonials}
            userId={currentUser?.id}
            username={profile?.username}
            theme={profile?.theme}
            showEmptyPlaceholder={true}
          />
        </div>
      </div>

      {/* Testimonials Management Section */}
      <div className="p-4 sm:p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Depoimentos Cadastrados ({testimonials.length})
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Gerencie as avaliações que entram no ciclo automático do carrossel.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsAddingReview(!isAddingReview)}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{isAddingReview ? 'Cancelar' : 'Novo Depoimento'}</span>
          </button>
        </div>

        {/* Add Review Inline Form */}
        {isAddingReview && (
          <form
            onSubmit={handleAddReview}
            className="p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl space-y-3 animate-in fade-in duration-200"
          >
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
              Adicionar Novo Depoimento de Cliente
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Nome do Cliente (ex: Sofia Matusse)"
                required
                className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <input
                type="text"
                value={clientRole}
                onChange={(e) => setClientRole(e.target.value)}
                placeholder="Cargo / Empresa (ex: CEO @ Digital Bloom)"
                className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <input
              type="url"
              value={clientAvatar}
              onChange={(e) => setClientAvatar(e.target.value)}
              placeholder="URL da Foto do Cliente (opcional - avatar padrão disponível)"
              className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Avaliação:
              </span>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setRating(s)}
                    className="focus:outline-none"
                  >
                    <Star
                      className={`w-4 h-4 ${
                        s <= rating
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-slate-300 dark:text-slate-600'
                      }`}
                    />
                  </button>
                ))}
                <span className="text-xs font-bold ml-1 text-slate-600 dark:text-slate-300">
                  {rating}.0
                </span>
              </div>
            </div>

            <textarea
              rows={2}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Texto do depoimento ou avaliação do cliente..."
              required
              className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />

            <button
              type="submit"
              className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all"
            >
              Salvar no Firestore & Ativar no Carrossel
            </button>
          </form>
        )}

        {/* Testimonials List Items */}
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {testimonials.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs">
              Nenhum depoimento cadastrado ainda. Clique em "Novo Depoimento" para adicionar.
            </div>
          ) : (
            testimonials.map((test) => (
              <div
                key={test.id}
                className="py-3 flex items-start justify-between gap-3 group"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <img
                    src={test.clientAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                    alt={test.clientName}
                    className="w-9 h-9 rounded-full object-cover ring-2 ring-emerald-500/20 shrink-0 mt-0.5"
                    onError={(e) => {
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100';
                    }}
                  />
                  <div className="min-w-0 space-y-0.5">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                        {test.clientName}
                      </h4>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400">
                        • {test.clientRole}
                      </span>
                      <div className="flex items-center">
                        {[...Array(test.rating)].map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 italic line-clamp-2">
                      "{test.comment}"
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => updateTestimonial(test.id, { featured: test.featured === false ? true : false })}
                    className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition-colors ${
                      test.featured !== false
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700'
                    }`}
                    title="Alternar se aparece no carrossel"
                  >
                    {test.featured !== false ? 'No Carrossel' : 'Oculto'}
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteTestimonial(test.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors"
                    title="Excluir depoimento do Firestore"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
