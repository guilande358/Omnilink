import React, { useState, useRef, useEffect } from 'react';
import { useOmniLink } from '../context/OmniLinkContext';
import {
  Sparkles,
  X,
  Wand2,
  Send,
  MessageSquare,
  Bot,
  User,
  CheckCircle2,
  ArrowRight,
  MessageCircle,
  Mail,
  Star,
  Video,
  Layers,
  Palette,
  DollarSign,
  Image as ImageIcon,
  Zap,
  HelpCircle,
} from 'lucide-react';
import { ArchitectureSuggestion } from '../types';

export const AiAssistantModal: React.FC = () => {
  const {
    isAiModalOpen,
    closeAiModal,
    generateFullProfileWithAi,
    sendAiChatMessage,
    chatMessages,
  } = useOmniLink();

  const [activeTab, setActiveTab] = useState<'chat' | 'full_profile'>('chat');
  const [niche, setNiche] = useState('Restaurante & Pizzaria Artesanal');
  const [prompt, setPrompt] = useState('Cria um perfil de alta conversão para pizzaria artesanal com entregas rápidas.');
  const [isGenerating, setIsGenerating] = useState(false);
  const [genSuccess, setGenSuccess] = useState(false);

  // Chat state
  const [userChatInput, setUserChatInput] = useState('');
  const [isSendingChat, setIsSendingChat] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom of chat
  useEffect(() => {
    if (activeTab === 'chat') {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, isSendingChat, activeTab]);

  if (!isAiModalOpen) return null;

  const handleGenerateFullProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    setGenSuccess(false);

    const res = await generateFullProfileWithAi(niche, prompt);
    setIsGenerating(false);

    if (res) {
      setGenSuccess(true);
      setTimeout(() => {
        setGenSuccess(false);
        setActiveTab('chat');
      }, 1500);
    }
  };

  const handleSendChat = async (e?: React.FormEvent, customText?: string) => {
    if (e) e.preventDefault();
    const textToSend = (customText || userChatInput).trim();
    if (!textToSend || isSendingChat) return;

    setUserChatInput('');
    setIsSendingChat(true);

    try {
      await sendAiChatMessage(textToSend);
    } finally {
      setIsSendingChat(false);
    }
  };

  const handleQuickReplyClick = (reply: string) => {
    handleSendChat(undefined, reply);
  };

  const getBlockIcon = (blockType: string) => {
    switch (blockType) {
      case 'lead_capture':
      case 'leadForm':
        return <Mail className="w-4 h-4 text-amber-500" />;
      case 'whatsapp_button':
      case 'whatsapp':
        return <MessageCircle className="w-4 h-4 text-emerald-500" />;
      case 'testimonials':
        return <Star className="w-4 h-4 text-yellow-500" />;
      case 'video_player':
      case 'featuredVideo':
        return <Video className="w-4 h-4 text-rose-500" />;
      case 'highlighted_links':
      case 'highlightedLink':
        return <Zap className="w-4 h-4 text-violet-500" />;
      case 'tip_jar':
      case 'tipJar':
        return <DollarSign className="w-4 h-4 text-teal-500" />;
      case 'gallery':
        return <ImageIcon className="w-4 h-4 text-indigo-500" />;
      case 'custom_theme':
      case 'theme':
        return <Palette className="w-4 h-4 text-fuchsia-500" />;
      default:
        return <Layers className="w-4 h-4 text-violet-500" />;
    }
  };

  const lastAiMessage = [...chatMessages].reverse().find((m) => m.sender === 'ai');
  const currentStage = lastAiMessage?.stage || 'architecture_proposal';

  const getStageBadge = (stage: string) => {
    switch (stage) {
      case 'collecting_info':
        return {
          label: 'Formulário Interativo: Coletando Dados',
          color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
        };
      case 'structure_applied':
        return {
          label: 'Estrutura & Blocos Aplicados no Site',
          color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
        };
      case 'refinement':
        return {
          label: 'Refinamento Fino & Otimização',
          color: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
        };
      case 'architecture_proposal':
      default:
        return {
          label: 'Arquiteto de Conversão: Proposta Estrutural',
          color: 'bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20',
        };
    }
  };

  const stageBadgeInfo = getStageBadge(currentStage);

  const quickStarters = [
    { label: '🍕 Restaurante / Pizzaria', prompt: 'Tenho um restaurante/pizzaria artesanal. Sugira a arquitetura ideal para receber pedidos.' },
    { label: '💼 Consultoria B2B', prompt: 'Sou consultor empresarial. Quero capturar leads qualificados e agendar reuniões.' },
    { label: '🎨 Freelancer / Designer', prompt: 'Sou designer freelancer. Preciso mostrar portfólio, depoimentos e receber contatos no WhatsApp.' },
    { label: '📱 Criador de Conteúdo', prompt: 'Sou criador de conteúdo digital e vendo infoprodutos. Quero aumentar vendas e subscritores.' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col h-[90vh] max-h-[780px]">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 text-white relative shrink-0">
          <button
            onClick={closeAiModal}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-black/20 hover:bg-black/40 text-white transition-colors"
            title="Fechar"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <div className="p-1 rounded-lg bg-white/20 backdrop-blur-md">
              <Sparkles className="w-4 h-4 text-amber-300" />
            </div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-white/90">
              Gemini 3.8 Flash • Arquiteto de Conversão
            </span>
            <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border bg-white/10 text-white`}>
              {stageBadgeInfo.label}
            </span>
          </div>

          <h3 className="text-lg sm:text-xl font-extrabold text-white">
            Sistema Conversacional de Arquitetura & Smart Bio
          </h3>
          <p className="text-xs text-white/80 mt-0.5">
            A IA analisa seu nicho, projeta a arquitetura de blocos perfeita e coleta dados essenciais para aplicar mudanças reais no seu site.
          </p>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 p-1.5 gap-1.5 shrink-0">
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex-1 py-2 text-xs font-extrabold rounded-xl transition-all flex items-center justify-center gap-2 ${
              activeTab === 'chat'
                ? 'bg-white dark:bg-slate-900 text-violet-600 dark:text-violet-400 shadow-sm border border-slate-200 dark:border-slate-700'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5 text-violet-500" />
            <span>Arquiteto & Formulário Interativo</span>
            <span className="text-[10px] bg-violet-100 dark:bg-violet-950/60 text-violet-700 dark:text-violet-300 px-1.5 py-0.2 rounded-md font-bold">
              Ativo
            </span>
          </button>

          <button
            onClick={() => setActiveTab('full_profile')}
            className={`flex-1 py-2 text-xs font-extrabold rounded-xl transition-all flex items-center justify-center gap-2 ${
              activeTab === 'full_profile'
                ? 'bg-white dark:bg-slate-900 text-violet-600 dark:text-violet-400 shadow-sm border border-slate-200 dark:border-slate-700'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Wand2 className="w-3.5 h-3.5 text-amber-500" />
            <span>Gerador Rápido (1-Clique)</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto flex flex-col p-4 sm:p-5">
          {activeTab === 'chat' ? (
            <div className="flex flex-col h-full justify-between">
              {/* Quick Niche Starter Chips (shown when few messages) */}
              {chatMessages.length <= 2 && (
                <div className="mb-3 p-3 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200/80 dark:border-slate-800 shrink-0">
                  <div className="flex items-center gap-1.5 mb-2 text-slate-700 dark:text-slate-300">
                    <Zap className="w-3.5 h-3.5 text-amber-500" />
                    <span className="text-[11px] font-bold">Comece rápido selecionando seu nicho:</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {quickStarters.map((starter, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSendChat(undefined, starter.prompt)}
                        disabled={isSendingChat}
                        className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-violet-400 dark:hover:border-violet-500 hover:bg-violet-50 dark:hover:bg-violet-950/30 text-slate-700 dark:text-slate-200 transition-all text-left flex items-center gap-1"
                      >
                        {starter.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Chat Messages Stream */}
              <div className="flex-1 overflow-y-auto space-y-4 pr-1 mb-3">
                {chatMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex items-start gap-2.5 ${
                      msg.sender === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    {msg.sender === 'ai' && (
                      <div className="w-7 h-7 rounded-xl bg-violet-600 text-white flex items-center justify-center shrink-0 mt-1 shadow-sm">
                        <Bot className="w-4 h-4" />
                      </div>
                    )}

                    <div
                      className={`max-w-[85%] sm:max-w-[80%] rounded-2xl p-3.5 space-y-3 ${
                        msg.sender === 'user'
                          ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-br-none shadow-md'
                          : 'bg-slate-50 dark:bg-slate-800/90 text-slate-900 dark:text-slate-100 rounded-bl-none border border-slate-200 dark:border-slate-700/80 shadow-sm'
                      }`}
                    >
                      {/* Main Message Text */}
                      <p className="text-xs sm:text-[13px] font-medium leading-relaxed whitespace-pre-line">
                        {msg.text}
                      </p>

                      {/* Architecture Suggestions Cards */}
                      {msg.suggestions && msg.suggestions.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700/80 space-y-2">
                          <div className="flex items-center gap-1.5 text-[11px] font-bold text-violet-700 dark:text-violet-300">
                            <Layers className="w-3.5 h-3.5" />
                            <span>Arquitetura de Conversão Recomendada:</span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {msg.suggestions.map((sugg, idx) => (
                              <div
                                key={idx}
                                className="p-2.5 rounded-xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-700 text-left space-y-1 shadow-xs hover:border-violet-300 dark:hover:border-violet-700 transition-colors"
                              >
                                <div className="flex items-center gap-1.5">
                                  <div className="p-1 rounded-md bg-slate-100 dark:bg-slate-800">
                                    {getBlockIcon(sugg.blockType)}
                                  </div>
                                  <span className="text-[11px] font-bold text-slate-900 dark:text-white line-clamp-1">
                                    {sugg.title}
                                  </span>
                                </div>
                                <p className="text-[10px] text-slate-600 dark:text-slate-300 leading-snug">
                                  {sugg.reason}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Real Structural Changes Applied Badges */}
                      {msg.appliedChanges && msg.appliedChanges.length > 0 && (
                        <div className="mt-2.5 pt-2.5 border-t border-emerald-500/20 bg-emerald-50/70 dark:bg-emerald-950/30 p-2.5 rounded-xl border border-emerald-200 dark:border-emerald-800 space-y-1.5">
                          <div className="flex items-center gap-1.5 text-[11px] font-extrabold text-emerald-800 dark:text-emerald-300">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                            <span>Estrutura Atualizada em Tempo Real no Site:</span>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {msg.appliedChanges.map((change, idx) => (
                              <span
                                key={idx}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200"
                              >
                                <CheckCircle2 className="w-2.5 h-2.5" />
                                {change}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Interactive Quick-Reply Action Chips */}
                      {msg.quickReplies && msg.quickReplies.length > 0 && (
                        <div className="mt-2.5 pt-2 border-t border-slate-200 dark:border-slate-700/60 space-y-1.5">
                          <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                            <HelpCircle className="w-3 h-3 text-violet-500" />
                            <span>Respostas Rápidas Recomendadas:</span>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {msg.quickReplies.map((reply, idx) => (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => handleQuickReplyClick(reply)}
                                disabled={isSendingChat}
                                className="text-[11px] font-bold px-2.5 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white shadow-xs hover:shadow transition-all flex items-center gap-1 disabled:opacity-50"
                              >
                                <span>{reply}</span>
                                <ArrowRight className="w-3 h-3" />
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {msg.sender === 'user' && (
                      <div className="w-7 h-7 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center shrink-0 mt-1">
                        <User className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                ))}

                {isSendingChat && (
                  <div className="flex items-start gap-2.5 justify-start animate-pulse">
                    <div className="w-7 h-7 rounded-xl bg-violet-600 text-white flex items-center justify-center shrink-0 mt-1">
                      <Bot className="w-4 h-4" />
                    </div>
                    <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-2xl rounded-bl-none text-xs text-slate-600 dark:text-slate-300 flex items-center gap-2 border border-slate-200 dark:border-slate-700">
                      <div className="w-3.5 h-3.5 border-2 border-violet-600 border-t-transparent rounded-full animate-spin" />
                      <span>O Arquiteto de Conversão está analisando a estrutura e os blocos ideais...</span>
                    </div>
                  </div>
                )}

                <div ref={chatBottomRef} />
              </div>

              {/* Chat Input Form */}
              <form onSubmit={handleSendChat} className="flex gap-2 shrink-0 pt-2 border-t border-slate-200 dark:border-slate-800">
                <input
                  type="text"
                  value={userChatInput}
                  onChange={(e) => setUserChatInput(e.target.value)}
                  placeholder="Responda à pergunta da IA ou solicite novos blocos e links..."
                  className="flex-1 px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500 shadow-inner"
                />
                <button
                  type="submit"
                  disabled={isSendingChat || !userChatInput.trim()}
                  className="px-4 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-md shadow-violet-500/20 transition-all flex items-center gap-1.5 disabled:opacity-50 shrink-0"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Enviar</span>
                </button>
              </form>
            </div>
          ) : (
            /* 1-Click Fast Generator Tab */
            <div className="space-y-4 max-w-lg mx-auto w-full py-2">
              {genSuccess ? (
                <div className="p-6 text-center space-y-2 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl animate-fade-in">
                  <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto animate-bounce" />
                  <h4 className="text-base font-extrabold text-slate-900 dark:text-white">
                    Perfil Completo Gerado com Sucesso! 🎉
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    Sua Bio, links estratégicos, formulário de captura e depoimentos foram criados e salvos no seu perfil.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleGenerateFullProfile} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Nicho ou Tipo do seu Negócio
                    </label>
                    <input
                      type="text"
                      value={niche}
                      onChange={(e) => setNiche(e.target.value)}
                      placeholder="ex: Pizzaria Artesanal, Designer de Interiores, Consultoria"
                      required
                      className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Instruções Específicas / Ofertas Principais
                    </label>
                    <textarea
                      rows={3}
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="Descreva a sua proposta, produtos principais, promoções ou tom de voz desejado..."
                      className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isGenerating}
                    className="w-full py-3 px-4 bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-violet-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isGenerating ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>A IA está a construir a arquitetura completa do perfil...</span>
                      </>
                    ) : (
                      <>
                        <Wand2 className="w-4 h-4" />
                        <span>Gerar Perfil Completo com IA ✨</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
