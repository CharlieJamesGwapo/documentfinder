import { useMemo } from 'react';
import { DOCUMENT_TYPES, getDocumentTypeConfig } from '../../constants/documentTypes.js';

const AnalyticsDashboard = ({ overview, loading }) => {
  const analytics = useMemo(() => {
    if (!overview) return null;

    const total = overview.totals?.totalDocuments || 0;
    const mfg = overview.totals?.manufacturingCount || 0;
    const quality = overview.totals?.qualityCount || 0;
    const mfgPercent = total > 0 ? Math.round((mfg / total) * 100) : 0;
    const qualityPercent = total > 0 ? Math.round((quality / total) * 100) : 0;

    // Build type breakdown from API data
    const typeBreakdown = (overview.typeBreakdown || []).map((item) => {
      const config = getDocumentTypeConfig(item.type);
      return {
        type: item.type,
        count: item.count,
        name: config.name,
        icon: config.icon,
        code: config.code,
        color: config.color
      };
    }).sort((a, b) => b.count - a.count);

    return {
      total,
      mfg,
      quality,
      mfgPercent,
      qualityPercent,
      categories: overview.categoryBreakdown || [],
      typeBreakdown
    };
  }, [overview]);

  const derivedData = useMemo(() => {
    if (!analytics) return null;
    const maxTypeCount = Math.max(...analytics.typeBreakdown.map(t => t.count), 1);
    const topCategories = analytics.categories.slice(0, 5);
    const maxCategoryCount = Math.max(...topCategories.map(c => c.count), 1);
    return { maxTypeCount, topCategories, maxCategoryCount };
  }, [analytics]);

  if (loading || !analytics || !derivedData) {
    return (
      <div className="grid gap-3 sm:gap-4 md:gap-6 md:grid-cols-2">
        <div className="h-64 animate-pulse rounded-lg bg-white/5 sm:rounded-2xl" />
        <div className="h-64 animate-pulse rounded-lg bg-white/5 sm:rounded-2xl" />
      </div>
    );
  }

  const { maxTypeCount, topCategories, maxCategoryCount } = derivedData;

  return (
    <section className="space-y-3 sm:space-y-4 md:space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.35em] text-primary/80">Analytics</p>
        <h2 className="font-heading text-xl text-white sm:text-2xl">Real-time insights</h2>
      </div>

      <div className="grid gap-3 sm:gap-4 md:gap-6 grid-cols-1 md:grid-cols-2">
        {/* Document Types Chart - All 6 types */}
        <div className="rounded-lg border border-white/5 bg-[#15161b] p-4 shadow-lg shadow-black/40 sm:rounded-2xl sm:p-6">
          <div className="mb-4 sm:mb-6">
            <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Document Types</p>
            <h3 className="font-heading text-lg text-white sm:text-xl">Distribution by type</h3>
          </div>

          <div className="space-y-3 sm:space-y-4">
            {analytics.typeBreakdown.length > 0 ? (
              analytics.typeBreakdown.map((item) => {
                const percent = analytics.total > 0 ? Math.round((item.count / analytics.total) * 100) : 0;
                return (
                  <div key={item.type} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs sm:text-sm">
                      <span className="flex items-center gap-2 text-slate-300">
                        <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-2xs font-semibold ${item.color.bg} ${item.color.text} ${item.color.border}`}>
                          <span>{item.icon}</span>
                          <span>{item.code}</span>
                        </span>
                        <span className="text-2xs sm:text-sm">{item.name}</span>
                      </span>
                      <span className={`font-semibold ${item.color.text}`}>{item.count} ({percent}%)</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-white/10 sm:h-3">
                      <div
                        className={`h-full transition-all duration-500 ${item.color.badge}`}
                        style={{ width: `${(item.count / maxTypeCount) * 100}%` }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-slate-500">No documents uploaded yet</p>
            )}

            <div className="border-t border-white/5 pt-4 sm:pt-6">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-300">Total Documents</span>
                <span className="font-heading text-2xl text-white sm:text-3xl">{analytics.total}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Category Breakdown Chart */}
        <div className="rounded-lg border border-white/5 bg-[#15161b] p-4 shadow-lg shadow-black/40 sm:rounded-2xl sm:p-6">
          <div className="mb-4 sm:mb-6">
            <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Top Categories</p>
            <h3 className="font-heading text-lg text-white sm:text-xl">By count</h3>
          </div>

          <div className="space-y-3 sm:space-y-4">
            {topCategories.length > 0 ? (
              topCategories.map((category, idx) => (
                <div key={category.category} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <span className="truncate text-slate-300">{category.category}</span>
                    <span className="ml-2 whitespace-nowrap font-semibold text-white">{category.count}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-white/10 sm:h-3">
                    <div
                      className={`h-full transition-all duration-500 ${
                        idx === 0
                          ? 'bg-gradient-to-r from-primary to-primary/60'
                          : idx === 1
                          ? 'bg-gradient-to-r from-emerald-400 to-emerald-400/60'
                          : idx === 2
                          ? 'bg-gradient-to-r from-blue-400 to-blue-400/60'
                          : idx === 3
                          ? 'bg-gradient-to-r from-purple-400 to-purple-400/60'
                          : 'bg-gradient-to-r from-cyan-400 to-cyan-400/60'
                      }`}
                      style={{ width: `${(category.count / maxCategoryCount) * 100}%` }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500">No categories yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Document Type Cards - Full Names with Icons */}
      <div className="grid gap-2 sm:gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
        {Object.values(DOCUMENT_TYPES).map((dt) => {
          const match = analytics.typeBreakdown.find((t) => t.code === dt.code);
          const count = match?.count ?? 0;
          const percent = analytics.total > 0 ? Math.round((count / analytics.total) * 100) : 0;
          return (
            <div key={dt.code} className={`rounded-xl border p-3 sm:rounded-2xl sm:p-4 transition-all hover:scale-[1.03] ${dt.color.bg} ${dt.color.border}`}>
              <div className="flex items-center gap-1.5 mb-2">
                <span className="text-base">{dt.icon}</span>
                <span className={`text-xs font-bold ${dt.color.text}`}>{dt.code}</span>
              </div>
              <p className={`font-heading text-xl sm:text-2xl ${dt.color.text}`}>{count}</p>
              <p className="mt-0.5 text-[0.6rem] leading-tight text-slate-400 sm:text-xs">{dt.name}</p>
              <p className="mt-0.5 text-[0.55rem] text-slate-500 sm:text-2xs">{percent}% of total</p>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default AnalyticsDashboard;
