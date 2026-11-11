import React, { useState } from 'react';
import { useOmniLink } from '../context/OmniLinkContext';
import { X, ShieldCheck, LogIn, UserPlus, CheckCircle2, Lock, Mail, User as UserIcon } from 'lucide-react';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, closeAuthModal, signUp, login, loginWithGoogle, currentUser, logout } = useOmniLink();

  const [mode, setMode] = useState<'login' | 'signup'>('signup');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleAuth, setIsGoogleAuth] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleTabSwitch = (newMode: 'login' | 'signup') => {
    setMode(newMode);
    setErrorMsg('');
    setSuccessMsg('');
  };

  const handleGoogleAuth = async () => {
    setIsGoogleAuth(true);
    setErrorMsg('');
    try {
      const res = await loginWithGoogle();
      setIsGoogleAuth(false);
      if (res.success) {
        setSuccessMsg(`Bem-vindo, ${res.user?.name || 'Criador'}! Sessão iniciada com o Google.`);
        setTimeout(() => {
          setSuccessMsg('');
          closeAuthModal();
        }, 1200);
      } else {
        setErrorMsg(res.message || 'Falha ao autenticar com a conta Google.');
      }
    } catch {
      setIsGoogleAuth(false);
      setErrorMsg('Falha ao conectar com o serviço do Google.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPass = password.trim();

    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      setErrorMsg('Por favor, informe um endereço de email válido.');
      return;
    }

    if (trimmedPass.length < 6) {
      setErrorMsg('A senha precisa conter no mínimo 6 caracteres.');
      return;
    }

    setIsSubmitting(true);

    try {
      if (mode === 'signup') {
        const trimmedName = name.trim();
        if (!trimmedName) {
          setErrorMsg('Por favor, informe o seu nome completo.');
          setIsSubmitting(false);
          return;
        }

        const desiredUsername =
          username.trim().toLowerCase().replace(/[^a-z0-9_]/g, '') ||
          trimmedEmail.split('@')[0].replace(/[^a-z0-9_]/g, '');

        const res = await signUp(trimmedName, trimmedEmail, trimmedPass, desiredUsername);
        setIsSubmitting(false);

        if (res.success) {
          setSuccessMsg(`Conta @${res.username} criada com sucesso! Bem-vindo ao OmniLink.`);
          setTimeout(() => {
            setSuccessMsg('');
            closeAuthModal();
          }, 1500);
        } else {
          setErrorMsg(res.message || 'Não foi possível cadastrar a conta. Tente novamente.');
        }
      } else {
        const res = await login(trimmedEmail, trimmedPass);
        setIsSubmitting(false);

        if (res.success) {
          setSuccessMsg(`Bem-vindo de volta, ${res.user?.name || 'Criador'}!`);
          setTimeout(() => {
            setSuccessMsg('');
            closeAuthModal();
          }, 1200);
        } else {
          setErrorMsg(res.message || 'Credenciais inválidas. Verifique seu email e senha.');
        }
      }
    } catch {
      setIsSubmitting(false);
      setErrorMsg('Ocorreu uma instabilidade na conexão. Tente novamente.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 text-white relative">
          <button
            onClick={closeAuthModal}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-black/20 hover:bg-black/40 text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="w-4 h-4 text-emerald-300" />
            <span className="text-xs font-bold uppercase tracking-wider text-white/80">
              OmniLink Cloud Auth
            </span>
          </div>

          <h3 className="text-xl font-extrabold text-white">
            {currentUser ? 'Gerenciar Conta' : mode === 'signup' ? 'Criar Sua Conta Grátis' : 'Entrar no OmniLink Studio'}
          </h3>
          <p className="text-xs text-white/80 mt-1">
            {currentUser
              ? `Conectado como ${currentUser.email}`
              : mode === 'signup'
              ? 'Junte-se a criadores globais para monetizar sua bio com links e prova social.'
              : 'Acesse seus links, depoimentos e métricas de conversão em tempo real.'}
          </p>
        </div>

        {/* Body */}
        <div className="p-6">
          {currentUser ? (
            <div className="space-y-4 text-center py-2">
              <div className="w-14 h-14 rounded-full bg-violet-100 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 font-extrabold text-xl flex items-center justify-center mx-auto ring-4 ring-violet-500/20">
                {currentUser.name.charAt(0).toUpperCase()}
              </div>

              <div>
                <h4 className="text-base font-extrabold text-slate-900 dark:text-white">
                  {currentUser.name}
                </h4>
                <p className="text-xs text-slate-500 font-mono">@{currentUser.username}</p>
                <p className="text-xs text-slate-400 mt-0.5">{currentUser.email}</p>
                {currentUser.isPro && (
                  <span className="inline-block mt-2 px-2.5 py-0.5 text-[10px] font-extrabold uppercase rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-300 dark:border-amber-700">
                    Plano Pro Ativo
                  </span>
                )}
              </div>

              <button
                onClick={() => {
                  logout();
                  closeAuthModal();
                }}
                className="w-full py-2.5 px-4 bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 text-rose-600 dark:text-rose-400 font-bold text-xs rounded-xl transition-colors"
              >
                Encerrar Sessão (Sair)
              </button>
            </div>
          ) : (
            <>
              {/* Google Sign-In Button */}
              <button
                type="button"
                onClick={handleGoogleAuth}
                disabled={isGoogleAuth || isSubmitting}
                className="w-full py-3 px-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-800 dark:text-white font-bold text-xs rounded-2xl shadow-sm transition-all flex items-center justify-center gap-2.5 mb-4"
              >
                {isGoogleAuth ? (
                  <div className="w-4 h-4 border-2 border-violet-600 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                )}
                <span>{isGoogleAuth ? 'Conectando ao Google...' : 'Continuar com o Google'}</span>
              </button>

              <div className="relative flex py-2 items-center mb-4">
                <div className="flex-grow border-t border-slate-200 dark:border-slate-800" />
                <span className="flex-shrink mx-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  ou use Email e Senha
                </span>
                <div className="flex-grow border-t border-slate-200 dark:border-slate-800" />
              </div>

              {/* Tab Toggle */}
              <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl mb-4">
                <button
                  type="button"
                  onClick={() => handleTabSwitch('signup')}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                    mode === 'signup'
                      ? 'bg-white dark:bg-slate-900 text-violet-600 dark:text-violet-400 shadow-sm'
                      : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                  }`}
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Criar Conta</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleTabSwitch('login')}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                    mode === 'login'
                      ? 'bg-white dark:bg-slate-900 text-violet-600 dark:text-violet-400 shadow-sm'
                      : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                  }`}
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Fazer Login</span>
                </button>
              </div>

              {errorMsg && (
                <div className="p-3 mb-3 bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 rounded-xl text-xs font-medium leading-relaxed">
                  {errorMsg}
                </div>
              )}

              {successMsg && (
                <div className="p-3 mb-3 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs font-medium flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
                  <span>{successMsg}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-3">
                {mode === 'signup' && (
                  <>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Nome Completo
                      </label>
                      <div className="relative">
                        <UserIcon className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Ex: Maria Santos"
                          required
                          className="w-full pl-9 pr-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Nome de Usuário / Link da Bio (@handle)
                      </label>
                      <div className="flex items-center">
                        <span className="px-3 py-2 text-xs bg-slate-200 dark:bg-slate-700 border border-r-0 border-slate-200 dark:border-slate-700 rounded-l-xl text-slate-500 font-mono font-bold">
                          @
                        </span>
                        <input
                          type="text"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          placeholder="suamarca"
                          className="w-full px-3.5 py-2 text-xs font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-r-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                        />
                      </div>
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Endereço de Email
                  </label>
                  <div className="relative">
                    <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="seuemail@exemplo.com"
                      required
                      className="w-full pl-9 pr-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Senha de Acesso (Mínimo 6 dígitos)
                  </label>
                  <div className="relative">
                    <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      minLength={6}
                      className="w-full pl-9 pr-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 px-4 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 disabled:opacity-70 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-violet-500/20 transition-all flex items-center justify-center gap-1.5 mt-2"
                >
                  {isSubmitting ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : mode === 'signup' ? (
                    <>
                      <UserPlus className="w-4 h-4" />
                      <span>Criar Conta & Ativar Minha Bio</span>
                    </>
                  ) : (
                    <>
                      <LogIn className="w-4 h-4" />
                      <span>Entrar no OmniLink Studio</span>
                    </>
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
