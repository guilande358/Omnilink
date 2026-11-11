import React from 'react';
import { useOmniLink } from '../../context/OmniLinkContext';
import { QrCode, Download, ExternalLink, Sparkles, FileCode, Palette } from 'lucide-react';

export const QrTab: React.FC = () => {
  const { openQrModal, profile } = useOmniLink();

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 text-white shadow-lg shadow-violet-500/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-extrabold tracking-tight">Printable Vector QR Code Studio</h2>
          <p className="text-xs text-white/80 mt-0.5">
            Generate vector QR codes with embedded profile avatar logos for menus, business cards, or packaging.
          </p>
        </div>

        <button
          onClick={openQrModal}
          className="px-4 py-2 bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-xs rounded-xl shadow transition-all flex items-center gap-1.5 shrink-0"
        >
          <QrCode className="w-4 h-4 text-slate-950" />
          <span>Launch Interactive QR Studio</span>
        </button>
      </div>

      {/* Main Feature Box */}
      <div className="p-6 sm:p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-center space-y-5 shadow-sm">
        <div className="w-16 h-16 rounded-2xl bg-violet-100 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 flex items-center justify-center mx-auto ring-8 ring-violet-50 dark:ring-violet-900/20">
          <QrCode className="w-8 h-8" />
        </div>

        <div className="max-w-md mx-auto space-y-1">
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
            Custom QR Code Ready for @{profile.username}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Scans directly to <span className="font-mono text-violet-600 dark:text-violet-400 font-bold">omnilink.app/u/{profile.username}</span> with brand color customizer and vector SVG export.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            onClick={openQrModal}
            className="px-5 py-3 bg-violet-600 hover:bg-violet-700 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-violet-500/20 transition-all inline-flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Customize Colors & Logo</span>
          </button>

          <button
            onClick={openQrModal}
            className="px-5 py-3 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl border border-slate-700 transition-all inline-flex items-center gap-2"
          >
            <FileCode className="w-4 h-4 text-emerald-400" />
            <span>Export SVG / PNG</span>
          </button>
        </div>
      </div>
    </div>
  );
};
