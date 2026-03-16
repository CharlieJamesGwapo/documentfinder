import { useMemo } from 'react';
import {
  Bell, ClipboardList, ShieldCheck, AlertTriangle, Eye, FileCheck2,
  ExternalLink, Battery, Box, Cog, Zap, Container, Home, Cpu, Truck,
  X, ChevronRight
} from 'lucide-react';
import { DOCUMENT_TYPES, getDocumentTypeConfig } from '../../constants/documentTypes.js';

/* ── Icon Maps ─────────────────────────────────────────────────────── */

const TYPE_ICONS = {
  MN: Bell,
  MI: ClipboardList,
  QI: ShieldCheck,
  QAN: AlertTriangle,
  VA: Eye,
  PCA: FileCheck2
};

const DEPARTMENTS = [
  { key: 'Battery Module', label: 'Battery Module', abbr: 'BM', icon: Battery },
  { key: 'Battery Pack', label: 'Battery Pack', abbr: 'BP', icon: Box },
  { key: 'Drive Unit', label: 'Drive Unit', abbr: 'DU', icon: Cog },
  { key: 'Energy', label: 'Energy', abbr: 'EN', icon: Zap },
  { key: 'Mega Pack', label: 'Mega Pack', abbr: 'MP', icon: Container },
  { key: 'Power Wall', label: 'Power Wall', abbr: 'PW', icon: Home },
  { key: 'PCS', label: 'PCS', abbr: 'PCS', icon: Cpu },
  { key: 'Semi', label: 'Semi', abbr: 'SM', icon: Truck }
];

/* ── Jira SVG ──────────────────────────────────────────────────────── */

const JiraIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M11.53 2c0 2.4 1.97 4.35 4.35 4.35h1.78v1.7c0 2.4 1.94 4.35 4.34 4.35V2.84A.84.84 0 0021.16 2H11.53z" />
    <path d="M6.77 6.8a4.36 4.36 0 004.34 4.34h1.8v1.72a4.36 4.36 0 004.34 4.34V7.63a.84.84 0 00-.84-.83H6.77z" opacity=".85" />
    <path d="M2 11.6a4.36 4.36 0 004.35 4.34h1.78v1.72C8.13 20.06 10.07 22 12.47 22V12.44a.84.84 0 00-.84-.84H2z" opacity=".65" />
  </svg>
);

/* ── Component ─────────────────────────────────────────────────────── */

const AnalyticsDashboard = ({
  overview,
  loading,
  activeType = '',
  onTypeClick,
  activeCategory = '',
  onCategoryClick,
  jiraUrl = ''
}) => {
  const analytics = useMemo(() => {
    if (!overview) return null;

    const total = overview.totals?.totalDocuments || 0;
    const mfg = overview.totals?.manufacturingCount || 0;
    const quality = overview.totals?.qualityCount || 0;

    const typeBreakdown = (overview.typeBreakdown || []).map((item) => {
      const config = getDocumentTypeConfig(item.type);
      return {
        type: item.type,
        count: item.count,
        name: config.name,
        code: config.code,
        color: config.color
      };
    }).sort((a, b) => b.count - a.count);

    return { total, mfg, quality, categories: overview.categoryBreakdown || [], typeBreakdown };
  }, [overview]);

  const derivedData = useMemo(() => {
    if (!analytics) return null;
    const maxTypeCount = Math.max(...analytics.typeBreakdown.map(t => t.count), 1);
    const topCategories = analytics.categories.slice(0, 5);
    const maxCategoryCount = Math.max(...topCategories.map(c => c.count), 1);
    return { maxTypeCount, topCategories, maxCategoryCount };
  }, [analytics]);

  /* ── Loading skeleton ──────────────────────────────────────────── */

  if (loading || !analytics || !derivedData) {
    return (
      <div className="space-y-3 sm:space-y-4">
        <div className="grid gap-3 sm:gap-4 md:grid-cols-2">
          <div className="h-64 animate-pulse rounded-xl bg-white/5" />
          <div className="h-64 animate-pulse rounded-xl bg-white/5" />
        </div>
        <div className="grid gap-2 grid-cols-3 md:grid-cols-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-xl bg-white/5" />
          ))}
        </div>
      </div>
    );
  }

  const { maxTypeCount, topCategories, maxCategoryCount } = derivedData;
  const activeTypeConfig = activeType ? DOCUMENT_TYPES[activeType] : null;

  return (
    <section className="space-y-3 sm:space-y-4 md:space-y-5">

      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-2xs uppercase tracking-[0.3em] text-primary/70 sm:text-xs">Analytics</p>
          <h2 className="font-heading text-lg text-white sm:text-2xl">Real-time insights</h2>
        </div>
        <a
          href={jiraUrl || 'https://jira.atlassian.net'}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex shrink-0 items-center gap-1.5 rounded-lg border border-[#2684FF]/25 bg-[#2684FF]/8 px-2.5 py-1.5 text-2xs font-semibold text-[#2684FF] transition-all hover:bg-[#2684FF]/15 hover:border-[#2684FF]/40 active:scale-95 sm:gap-2 sm:rounded-xl sm:px-4 sm:py-2 sm:text-xs touch-manipulation"
        >
          <JiraIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          <span className="hidden xs:inline">JIRA</span>
          <ExternalLink className="h-2.5 w-2.5 opacity-50 sm:h-3 sm:w-3" />
        </a>
      </div>

      {/* ── Active Filter Breadcrumb ───────────────────────────────── */}
      {(activeType || activeCategory) && (
        <div className="flex items-center gap-2 rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2 sm:rounded-xl sm:px-4 sm:py-2.5">
          <span className="text-2xs text-slate-500 sm:text-xs">Filtering:</span>
          <div className="flex items-center gap-1.5">
            {activeType && (
              <button
                type="button"
                onClick={() => onTypeClick?.(activeType)}
                className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-2xs font-semibold transition hover:opacity-80 active:scale-95 sm:text-xs ${activeTypeConfig?.color.bg} ${activeTypeConfig?.color.text} ${activeTypeConfig?.color.border}`}
              >
                {activeType}
                <X className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
              </button>
            )}
            {activeType && activeCategory && (
              <ChevronRight className="h-3 w-3 text-slate-600" />
            )}
            {activeCategory && (
              <button
                type="button"
                onClick={() => onCategoryClick?.('')}
                className="inline-flex items-center gap-1 rounded-md border border-primary/25 bg-primary/10 px-2 py-0.5 text-2xs font-semibold text-primary transition hover:opacity-80 active:scale-95 sm:text-xs"
              >
                {activeCategory}
                <X className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── Charts Row ─────────────────────────────────────────────── */}
      <div className="grid gap-3 sm:gap-4 grid-cols-1 md:grid-cols-2">

        {/* Document Types Distribution */}
        <div className="rounded-xl border border-white/5 bg-[#15161b] p-3.5 shadow-lg shadow-black/30 sm:rounded-2xl sm:p-5">
          <div className="mb-3 sm:mb-5">
            <p className="text-2xs uppercase tracking-[0.3em] text-slate-500 sm:text-xs">Document Types</p>
            <h3 className="font-heading text-base text-white sm:text-lg">Distribution</h3>
          </div>
          <div className="space-y-2.5 sm:space-y-3">
            {analytics.typeBreakdown.length > 0 ? (
              analytics.typeBreakdown.map((item) => {
                const percent = analytics.total > 0 ? Math.round((item.count / analytics.total) * 100) : 0;
                return (
                  <div key={item.type} className="space-y-1">
                    <div className="flex items-center justify-between text-2xs sm:text-xs">
                      <span className="flex items-center gap-1.5 text-slate-300">
                        <span className={`inline-flex rounded border px-1.5 py-px text-3xs font-bold sm:text-2xs ${item.color.bg} ${item.color.text} ${item.color.border}`}>
                          {item.code}
                        </span>
                        <span className="hidden sm:inline text-slate-400">{item.name}</span>
                      </span>
                      <span className={`tabular-nums font-semibold ${item.color.text}`}>{item.count}<span className="text-slate-500 font-normal ml-1">({percent}%)</span></span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-white/5 sm:h-2">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ease-out ${item.color.badge}`}
                        style={{ width: `${(item.count / maxTypeCount) * 100}%` }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="py-4 text-center text-xs text-slate-500">No documents uploaded yet</p>
            )}
            <div className="mt-1 flex items-center justify-between border-t border-white/5 pt-3 sm:pt-4">
              <span className="text-2xs text-slate-400 sm:text-xs">Total</span>
              <span className="font-heading text-xl text-white sm:text-2xl">{analytics.total}</span>
            </div>
          </div>
        </div>

        {/* Top Categories */}
        <div className="rounded-xl border border-white/5 bg-[#15161b] p-3.5 shadow-lg shadow-black/30 sm:rounded-2xl sm:p-5">
          <div className="mb-3 sm:mb-5">
            <p className="text-2xs uppercase tracking-[0.3em] text-slate-500 sm:text-xs">Top Departments</p>
            <h3 className="font-heading text-base text-white sm:text-lg">By count</h3>
          </div>
          <div className="space-y-2.5 sm:space-y-3">
            {topCategories.length > 0 ? (
              topCategories.map((category, idx) => {
                const barColors = [
                  'bg-gradient-to-r from-primary to-primary/50',
                  'bg-gradient-to-r from-slate-300 to-slate-300/50',
                  'bg-gradient-to-r from-slate-400 to-slate-400/50',
                  'bg-gradient-to-r from-slate-500 to-slate-500/50',
                  'bg-gradient-to-r from-slate-600 to-slate-600/50'
                ];
                return (
                  <div key={category.category} className="space-y-1">
                    <div className="flex items-center justify-between text-2xs sm:text-xs">
                      <span className="truncate text-slate-300 pr-2">{category.category}</span>
                      <span className="tabular-nums font-semibold text-white">{category.count}</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-white/5 sm:h-2">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ease-out ${barColors[idx] || barColors[4]}`}
                        style={{ width: `${(category.count / maxCategoryCount) * 100}%` }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="py-4 text-center text-xs text-slate-500">No departments yet</p>
            )}
          </div>
        </div>
      </div>

      {/* ── Document Type Cards ─────────────────────────────────────── */}
      <div className="grid gap-2 grid-cols-3 sm:gap-2.5 md:grid-cols-6">
        {Object.values(DOCUMENT_TYPES).map((dt) => {
          const Icon = TYPE_ICONS[dt.code];
          const match = analytics.typeBreakdown.find((t) => t.code === dt.code);
          const count = match?.count ?? 0;
          const isActive = activeType === dt.code;

          return (
            <button
              key={dt.code}
              type="button"
              onClick={() => onTypeClick?.(dt.code)}
              className={`group relative flex flex-col items-center rounded-xl border p-2.5 transition-all duration-200 touch-manipulation sm:rounded-2xl sm:p-3.5
                ${isActive
                  ? `border-primary/40 bg-primary/10 ring-1 ring-primary/50 shadow-lg shadow-primary/5`
                  : `${dt.color.bg} ${dt.color.border} hover:bg-white/[0.06] hover:border-white/15 active:scale-95`
                }`}
            >
              {isActive && (
                <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-primary sm:h-2.5 sm:w-2.5">
                  <span className="absolute inset-0 animate-ping rounded-full bg-primary/60" />
                </span>
              )}
              {Icon && (
                <Icon
                  className={`h-4 w-4 transition-all duration-200 group-hover:scale-110 sm:h-5 sm:w-5
                    ${isActive ? 'text-primary' : dt.color.text}`}
                />
              )}
              <span className={`mt-1 text-2xs font-bold sm:text-xs ${isActive ? 'text-primary' : dt.color.text}`}>
                {dt.code}
              </span>
              <span className={`font-heading text-lg leading-none sm:text-xl ${isActive ? 'text-white' : dt.color.text}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Department Picker ──────────────────────────────────────── */}
      {activeType && (
        <div className="overflow-hidden rounded-xl border border-white/5 bg-[#15161b] shadow-lg shadow-black/30 sm:rounded-2xl animate-slide-up">
          <div className="flex items-center justify-between border-b border-white/5 px-3 py-2 sm:px-4 sm:py-2.5">
            <div className="flex items-center gap-2">
              <span className={`inline-flex rounded border px-1.5 py-px text-3xs font-bold sm:text-2xs ${activeTypeConfig?.color.bg} ${activeTypeConfig?.color.text} ${activeTypeConfig?.color.border}`}>
                {activeType}
              </span>
              <span className="text-2xs text-slate-400 sm:text-xs">Select Department</span>
            </div>
            {activeCategory && (
              <button
                type="button"
                onClick={() => onCategoryClick?.('')}
                className="flex items-center gap-1 text-2xs text-slate-500 transition hover:text-white sm:text-xs"
              >
                Clear
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
          <div className="grid grid-cols-4 gap-px bg-white/[0.02] sm:grid-cols-8">
            {DEPARTMENTS.map((dept) => {
              const DeptIcon = dept.icon;
              const isActive = activeCategory === dept.key;

              return (
                <button
                  key={dept.key}
                  type="button"
                  onClick={() => onCategoryClick?.(isActive ? '' : dept.key)}
                  className={`group flex flex-col items-center justify-center gap-0.5 py-3 transition-all duration-150 touch-manipulation sm:gap-1 sm:py-4
                    ${isActive
                      ? 'bg-primary/12 text-primary'
                      : 'bg-transparent text-slate-500 hover:bg-white/[0.04] hover:text-slate-200'
                    }`}
                >
                  <DeptIcon className={`h-4 w-4 transition-transform duration-150 group-hover:scale-110 sm:h-5 sm:w-5 ${isActive ? 'text-primary' : ''}`} />
                  <span className="text-center text-[0.5rem] font-medium leading-tight sm:text-2xs">{dept.label}</span>
                  {isActive && (
                    <span className="mt-0.5 h-0.5 w-3 rounded-full bg-primary sm:w-4" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
};

export default AnalyticsDashboard;
