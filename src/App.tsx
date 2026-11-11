import React from 'react';
import { AuthProvider } from './context/AuthContext';
import { OmniLinkProvider, useOmniLink } from './context/OmniLinkContext';
import { Navbar } from './components/Navbar';
import { LandingPage } from './views/LandingPage';
import { DashboardPage } from './views/DashboardPage';
import { PublicProfilePage } from './views/PublicProfilePage';
import { TrywalledModal } from './components/TrywalledModal';
import { AiAssistantModal } from './components/AiAssistantModal';
import { TipJarModal } from './components/TipJarModal';
import { QrCodeModal } from './components/QrCodeModal';
import { AuthModal } from './components/AuthModal';
import { BillingCallbackBanner } from './components/BillingCallbackBanner';

const MainLayout: React.FC = () => {
  const { activeView } = useOmniLink();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors flex flex-col">
      {/* Conditionally render navbar unless in standalone public bio view */}
      {activeView !== 'public' && <Navbar />}

      {/* Global Billing Callback Notification Banner */}
      <BillingCallbackBanner />

      <main className="flex-1">
        {activeView === 'landing' && <LandingPage />}
        {activeView === 'dashboard' && <DashboardPage />}
        {activeView === 'public' && <PublicProfilePage />}
      </main>

      {/* Global Overlays & Modals */}
      <AuthModal />
      <TrywalledModal />
      <AiAssistantModal />
      <TipJarModal />
      <QrCodeModal />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <OmniLinkProvider>
        <MainLayout />
      </OmniLinkProvider>
    </AuthProvider>
  );
}
