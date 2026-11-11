import React from 'react';
import { useOmniLink } from '../../context/OmniLinkContext';
import {
  BarChart3,
  TrendingUp,
  Users,
  MousePointer,
  Globe,
  Smartphone,
  Lock,
  Crown,
  Download,
  FileText,
  Clock,
} from 'lucide-react';

export const AnalyticsTab: React.FC = () => {
  const { analytics, links, profile, openTrywalledModal, exportReportPdf, exportLeadsCsv } = useOmniLink();

  // Find maximum hourly click count for chart scaling
  const maxHourlyClick = Math.max(...analytics.hourlyClicks.map((h) => h.clicks), 1);

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 text-white shadow-lg shadow-blue-500/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-extrabold tracking-tight">Real-Time Click & Traffic Analytics</h2>
            {!profile.isPro && (
              <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-amber-300 text-slate-950 flex items-center gap-1">
                <Crown className="w-3 h-3 text-amber-600" />
                <span>Pro Preview</span>
              </span>
            )}
          </div>
          <p className="text-xs text-white/80 mt-0.5">
            Hourly trends, click-through rates, top referrers, and printable PDF reports.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={exportReportPdf}
            className="px-3.5 py-2 bg-white text-blue-700 hover:bg-blue-50 font-bold text-xs rounded-xl shadow transition-all flex items-center gap-1.5"
          >
            <FileText className="w-4 h-4 text-blue-600" />
            <span>Export PDF Report</span>
          </button>

          {!profile.isPro && (
            <button
              onClick={openTrywalledModal}
              className="px-3 py-2 bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-bold text-xs rounded-xl shadow transition-all flex items-center gap-1"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Upgrade ($9)</span>
            </button>
          )}
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold">
            <span>Total Profile Clicks</span>
            <MousePointer className="w-4 h-4 text-violet-500" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white font-mono tabular-nums">
            {analytics.totalClicks.toLocaleString()}
          </div>
          <div className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            <span>+18.4% vs last week</span>
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold">
            <span>Profile Page Views</span>
            <Users className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white font-mono tabular-nums">
            {analytics.totalViews.toLocaleString()}
          </div>
          <div className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            <span>+12.1% unique visitors</span>
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold">
            <span>Click-Through Rate (CTR)</span>
            <BarChart3 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white font-mono tabular-nums">
            {analytics.ctr}%
          </div>
          <div className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            <span>Top 5% creator benchmark</span>
          </div>
        </div>
      </div>

      {/* Hourly Clicks Interactive Bar Chart */}
      <div className="p-4 sm:p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-3 shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-indigo-500" />
            <span>Hourly Clicks Distribution Today</span>
          </h3>
          <span className="text-[11px] font-mono text-slate-400">Peak hour: 12:00</span>
        </div>

        <div className="pt-4 flex items-end justify-between gap-2 h-36">
          {analytics.hourlyClicks.map((item, idx) => {
            const heightPct = Math.round((item.clicks / maxHourlyClick) * 100);

            return (
              <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-mono font-bold text-violet-600 dark:text-violet-400">
                  {item.clicks}
                </div>
                <div
                  className="w-full max-w-[28px] bg-gradient-to-t from-violet-600 to-indigo-500 rounded-t-lg transition-all duration-300 group-hover:bg-amber-500"
                  style={{ height: `${Math.max(heightPct, 8)}%` }}
                />
                <span className="text-[10px] font-mono text-slate-400 tracking-tight">
                  {item.hour}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Referrers & Device Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Top Referrers */}
        <div className="p-4 sm:p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-3 shadow-sm">
          <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-blue-500" />
            <span>Traffic Acquisition Sources</span>
          </h3>

          <div className="space-y-2">
            {analytics.topReferrers.map((item, idx) => {
              const refPct = Math.round((item.visits / analytics.totalViews) * 100);

              return (
                <div key={idx} className="p-2.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl space-y-1">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200">
                    <span>{item.source}</span>
                    <span className="font-mono text-indigo-600 dark:text-indigo-400">
                      {item.visits} ({refPct}%)
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-600 rounded-full"
                      style={{ width: `${refPct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Country Breakdown */}
        <div className="p-4 sm:p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-3 shadow-sm">
          <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-emerald-500" />
            <span>Top Geographic Regions</span>
          </h3>

          <div className="space-y-2">
            {analytics.countryBreakdown.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between text-xs py-1.5 border-b border-slate-100 dark:border-slate-800"
              >
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  {item.country}
                </span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">
                  {item.percentage}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
