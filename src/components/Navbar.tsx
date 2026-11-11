import React from 'react';
import { useOmniLink } from '../context/OmniLinkContext';
import { Sun, Moon, Crown, ExternalLink, User, LogIn } from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    profile,
    currentUser,
    openAuthModal,
    isDarkMode,
    toggleDarkMode,
    activeView,
    setActiveView,
    openTrywalledModal,
  } = useOmniLink();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-8 px-4 sm:px-6 py-3.5">
        {/* Zone 1: Brand wordmark */}
        <button
          onClick={() => setActiveView('landing')}
          className="flex items-center gap-2 text-left group focus:outline-none"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-emerald-500 p-1 flex items-center justify-center text-white shadow-md shadow-violet-500/20 group-hover:scale-105 transition-transform overflow-hidden">
            <img src="/logo.svg" alt="OmniLink" className="w-full h-full object-contain rounded-lg" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-white whitespace-nowrap shrink-0">
              OmniLink
            </span>
            <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 tracking-wider uppercase -mt-1 hidden sm:inline-block">
              Bio & Social Proof
            </span>
          </div>
        </button>

        {/* Zone 2: Navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300">
          <button
            onClick={() => setActiveView('landing')}
            className={`transition-colors whitespace-nowrap shrink-0 ${
              activeView === 'landing'
                ? 'text-violet-600 dark:text-violet-400 font-semibold'
                : 'hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Home
          </button>
          <button
            onClick={() => setActiveView('dashboard')}
            className={`transition-colors whitespace-nowrap shrink-0 ${
              activeView === 'dashboard'
                ? 'text-violet-600 dark:text-violet-400 font-semibold'
                : 'hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Studio Dashboard
          </button>
          <button
            onClick={() => setActiveView('public')}
            className={`transition-colors whitespace-nowrap shrink-0 flex items-center gap-1 ${
              activeView === 'public'
                ? 'text-violet-600 dark:text-violet-400 font-semibold'
                : 'hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <span>Live Bio Page</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={openTrywalledModal}
            className="text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1 font-medium"
          >
            <Crown className="w-4 h-4 text-amber-500" />
            <span>Trywalled Pro Plan</span>
          </button>
        </nav>

        {/* Zone 3: Actions, Auth & Theme Toggle */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={toggleDarkMode}
            className="p-2 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none"
            aria-label="Toggle theme"
          >
            {isDarkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-700" />}
          </button>

          {/* User Auth Account Button */}
          <button
            onClick={openAuthModal}
            className="p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors flex items-center gap-1.5"
            title="Account Settings"
          >
            {currentUser ? (
              <>
                <div className="w-5 h-5 rounded-full bg-violet-600 text-white font-extrabold text-[10px] flex items-center justify-center">
                  {currentUser.name.charAt(0)}
                </div>
                <span className="hidden sm:inline font-mono">@{currentUser.username}</span>
              </>
            ) : (
              <>
                <User className="w-4 h-4 text-violet-500" />
                <span className="hidden sm:inline">Sign In / Account</span>
              </>
            )}
          </button>

          {profile.isPro ? (
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 rounded-full text-xs font-semibold text-amber-700 dark:text-amber-300">
              <Crown className="w-3.5 h-3.5 text-amber-500" />
              <span>PRO ACTIVE</span>
            </div>
          ) : (
            <button
              onClick={openTrywalledModal}
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 rounded-lg shadow-sm hover:shadow transition-all whitespace-nowrap shrink-0"
            >
              <Crown className="w-3.5 h-3.5" />
              <span>Upgrade ($9/mo)</span>
            </button>
          )}

          {activeView === 'landing' ? (
            <button
              onClick={() => setActiveView('dashboard')}
              className="px-4 py-2 text-xs font-bold text-white bg-slate-900 dark:bg-violet-600 hover:bg-slate-800 dark:hover:bg-violet-500 rounded-lg transition-colors whitespace-nowrap shrink-0 shadow-sm"
            >
              Create Free Link
            </button>
          ) : null}
        </div>
      </div>
    </header>
  );
};
