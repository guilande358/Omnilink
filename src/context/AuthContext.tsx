import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User as FirebaseUser,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile as updateFirebaseProfile,
} from 'firebase/auth';
import { auth, googleProvider } from '../firebase';
import { userService } from '../services/firestoreService';
import { UserAccount } from '../types';

interface AuthContextType {
  firebaseUser: FirebaseUser | null;
  currentUser: UserAccount | null;
  loading: boolean;
  loginWithGoogle: () => Promise<{ success: boolean; message?: string; user?: UserAccount }>;
  loginWithEmail: (email: string, pass: string) => Promise<{ success: boolean; message?: string; user?: UserAccount }>;
  signUpWithEmail: (name: string, email: string, pass: string, username: string) => Promise<{ success: boolean; message?: string; username?: string }>;
  logout: () => Promise<void>;
  updateCurrentUserAccount: (updated: Partial<UserAccount>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper for user-friendly Portuguese error messages
export function formatAuthError(error: any): string {
  if (!error) return 'Ocorreu um erro inesperado na autenticação.';
  const code = error.code || '';
  const message = error.message || '';

  if (code === 'auth/email-already-in-use' || message.includes('email-already-in-use')) {
    return 'Este endereço de email já está cadastrado. Faça login com sua senha ou pelo Google.';
  }
  if (code === 'auth/weak-password' || message.includes('weak-password') || message.includes('at least 6 characters')) {
    return 'A senha precisa ter pelo menos 6 caracteres para garantir a segurança da conta.';
  }
  if (code === 'auth/invalid-email' || message.includes('invalid-email')) {
    return 'O formato do endereço de email digitado é inválido. Por favor, confira a digitação.';
  }
  if (code === 'auth/user-not-found' || message.includes('user-not-found')) {
    return 'Nenhuma conta encontrada com este email. Verifique o endereço ou cadastre-se.';
  }
  if (
    code === 'auth/wrong-password' ||
    code === 'auth/invalid-credential' ||
    message.includes('invalid-credential') ||
    message.includes('wrong-password')
  ) {
    return 'Email ou senha incorretos. Por favor, verifique seus dados e tente novamente.';
  }
  if (code === 'auth/too-many-requests' || message.includes('too-many-requests')) {
    return 'Muitas tentativas consecutivas. Por favor, aguarde alguns instantes antes de tentar novamente.';
  }
  if (code === 'auth/popup-closed-by-user' || message.includes('popup-closed-by-user')) {
    return 'A janela de autenticação do Google foi fechada antes da confirmação.';
  }
  if (code === 'auth/network-request-failed' || message.includes('network-request-failed')) {
    return 'Falha na conexão de rede. Por favor, verifique a sua conexão com a internet.';
  }
  if (code === 'auth/operation-not-allowed') {
    return 'Método de autenticação em atualização no servidor. Tentando conexão segura alternativa...';
  }
  return message || 'Não foi possível concluir a autenticação. Verifique os dados digitados.';
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fUser) => {
      setFirebaseUser(fUser);
      if (fUser) {
        let account = await userService.getUser(fUser.uid);
        if (!account) {
          const cleanEmail = fUser.email || '';
          const cleanUsername = cleanEmail
            ? cleanEmail.split('@')[0].toLowerCase().replace(/[^a-z0-9_]/g, '')
            : `usr_${fUser.uid.slice(0, 6)}`;
          account = {
            id: fUser.uid,
            name: fUser.displayName || cleanUsername,
            email: cleanEmail,
            username: cleanUsername,
            isPro: false,
            createdAt: new Date().toISOString(),
          };
          await userService.saveUser(account);
        }
        const userWithMethod: UserAccount = { ...account, authMethod: 'google' };
        setCurrentUser(userWithMethod);
        localStorage.setItem('omnilink_user_session', JSON.stringify(userWithMethod));
      } else {
        // If not authenticated via Firebase client, check if there is an active email-authenticated session
        const savedSession = localStorage.getItem('omnilink_user_session');
        if (savedSession) {
          try {
            const parsed = JSON.parse(savedSession);
            if (parsed && parsed.id && parsed.authMethod === 'email') {
              setCurrentUser(parsed);
              setLoading(false);
              return;
            }
          } catch {
            // ignore
          }
        }
        setCurrentUser(null);
        localStorage.removeItem('omnilink_user_session');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const fUser = result.user;
      let account = await userService.getUser(fUser.uid);
      if (!account) {
        const cleanEmail = fUser.email || '';
        const cleanUsername = cleanEmail
          ? cleanEmail.split('@')[0].toLowerCase().replace(/[^a-z0-9_]/g, '')
          : `usr_${fUser.uid.slice(0, 6)}`;
        account = {
          id: fUser.uid,
          name: fUser.displayName || 'Google Creator',
          email: cleanEmail,
          username: cleanUsername,
          isPro: false,
          createdAt: new Date().toISOString(),
        };
        await userService.saveUser(account);
      }
      const userWithMethod: UserAccount = { ...account, authMethod: 'google' };
      setCurrentUser(userWithMethod);
      localStorage.setItem('omnilink_user_session', JSON.stringify(userWithMethod));
      return { success: true, user: userWithMethod };
    } catch (error: any) {
      if (
        error?.code === 'auth/popup-closed-by-user' ||
        error?.code === 'auth/cancelled-popup-request' ||
        error?.message?.includes('popup-closed-by-user') ||
        error?.message?.includes('cancelled-popup-request')
      ) {
        console.warn('[Google Auth] Popup cancelado ou fechado pelo usuário.');
        return {
          success: false,
          message: 'A janela de autenticação do Google foi fechada antes da confirmação. Clique novamente para continuar.',
        };
      }
      console.error('Google Auth Error:', error);
      return { success: false, message: formatAuthError(error) };
    }
  };

  const loginWithEmail = async (email: string, pass: string) => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !pass) {
      return { success: false, message: 'Por favor, preencha o email e a senha.' };
    }

    // 1. Try Firebase Client SDK
    try {
      const cred = await signInWithEmailAndPassword(auth, cleanEmail, pass);
      const fUser = cred.user;
      let account = await userService.getUser(fUser.uid);
      if (!account) {
        const cleanUsername = cleanEmail.split('@')[0].toLowerCase().replace(/[^a-z0-9_]/g, '');
        account = {
          id: fUser.uid,
          name: fUser.displayName || cleanUsername,
          email: cleanEmail,
          username: cleanUsername,
          isPro: false,
          createdAt: new Date().toISOString(),
        };
        await userService.saveUser(account);
      }
      const userWithMethod: UserAccount = { ...account, authMethod: 'google' };
      setCurrentUser(userWithMethod);
      localStorage.setItem('omnilink_user_session', JSON.stringify(userWithMethod));
      return { success: true, user: userWithMethod };
    } catch (firebaseErr: any) {
      console.warn('[Firebase Auth Login Fallback Triggered]', firebaseErr?.code || firebaseErr?.message);

      // 2. Resilient Server-Side Auth Fallback
      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: cleanEmail, password: pass }),
        });
        const data = await res.json();
        if (data.success && data.user) {
          const userWithMethod: UserAccount = { ...data.user, authMethod: 'email' };
          setCurrentUser(userWithMethod);
          localStorage.setItem('omnilink_user_session', JSON.stringify(userWithMethod));
          return { success: true, user: userWithMethod };
        }
        return { success: false, message: data.message || formatAuthError(firebaseErr) };
      } catch {
        return { success: false, message: formatAuthError(firebaseErr) };
      }
    }
  };

  const signUpWithEmail = async (name: string, email: string, pass: string, username: string) => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim() || cleanEmail.split('@')[0];
    const cleanUsername =
      username.trim().toLowerCase().replace(/[^a-z0-9_]/g, '') ||
      cleanEmail.split('@')[0].replace(/[^a-z0-9_]/g, '');

    if (!cleanEmail.includes('@')) {
      return { success: false, message: 'Por favor, insira um endereço de email válido.' };
    }
    if (pass.length < 6) {
      return { success: false, message: 'A senha precisa ter no mínimo 6 caracteres.' };
    }

    // 1. Try Firebase Client SDK
    try {
      const cred = await createUserWithEmailAndPassword(auth, cleanEmail, pass);
      const fUser = cred.user;
      if (auth.currentUser) {
        await updateFirebaseProfile(auth.currentUser, { displayName: cleanName });
      }
      const account: UserAccount = {
        id: fUser.uid,
        name: cleanName,
        email: cleanEmail,
        username: cleanUsername,
        isPro: false,
        createdAt: new Date().toISOString(),
      };
      await userService.saveUser(account);
      const userWithMethod: UserAccount = { ...account, authMethod: 'google' };
      setCurrentUser(userWithMethod);
      localStorage.setItem('omnilink_user_session', JSON.stringify(userWithMethod));
      return { success: true, username: cleanUsername };
    } catch (firebaseErr: any) {
      console.warn('[Firebase Auth SignUp Fallback Triggered]', firebaseErr?.code || firebaseErr?.message);

      if (firebaseErr?.code === 'auth/email-already-in-use') {
        return { success: false, message: formatAuthError(firebaseErr) };
      }

      // 2. Resilient Server-Side Registration Fallback
      try {
        const res = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: cleanName,
            email: cleanEmail,
            password: pass,
            username: cleanUsername,
          }),
        });
        const data = await res.json();
        if (data.success && data.user) {
          const userWithMethod: UserAccount = { ...data.user, authMethod: 'email' };
          setCurrentUser(userWithMethod);
          localStorage.setItem('omnilink_user_session', JSON.stringify(userWithMethod));
          return { success: true, username: data.username || cleanUsername };
        }
        return { success: false, message: data.message || formatAuthError(firebaseErr) };
      } catch {
        return { success: false, message: formatAuthError(firebaseErr) };
      }
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.warn('Sign out warning:', e);
    }
    localStorage.removeItem('omnilink_user_session');
    setFirebaseUser(null);
    setCurrentUser(null);
  };

  const updateCurrentUserAccount = (updated: Partial<UserAccount>) => {
    if (currentUser) {
      const newAcc = { ...currentUser, ...updated };
      setCurrentUser(newAcc);
      localStorage.setItem('omnilink_user_session', JSON.stringify(newAcc));
      userService.saveUser(newAcc);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        firebaseUser,
        currentUser,
        loading,
        loginWithGoogle,
        loginWithEmail,
        signUpWithEmail,
        logout,
        updateCurrentUserAccount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
