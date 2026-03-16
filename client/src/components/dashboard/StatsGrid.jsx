import clsx from 'clsx';
import { SkeletonStats } from '../common/Skeleton.jsx';

const StatCard = ({ label, value, sublabel, accent, loading }) => (
  <div
    className={clsx(
      'rounded-lg border border-white/5 bg-gradient-to-br from-[#1b1c22] to-[#111216] p-3 text-white shadow-lg shadow-black/40 sm:rounded-2xl sm:p-5 touch-manipulation tap-highlight transition-transform hover:scale-105 active:scale-95',
      accent === 'primary' && 'from-primary/10 to-primary/5 border-primary/20',
      accent === 'quality' && 'from-slate-400/10 to-slate-500/5 border-slate-300/30'
    )}
  >
    <p className="text-xs uppercase tracking-[0.35em] text-slate-400">{label}</p>
    {loading ? (
      <div className="mt-2 h-7 w-20 animate-pulse rounded bg-white/10 sm:mt-4 sm:h-9 sm:w-24" />
    ) : (
      <p className="mt-2 font-heading text-2xl sm:mt-3 sm:text-3xl">{value}</p>
    )}
    {sublabel && (
      <p className="mt-1 text-xs text-slate-400 sm:text-sm">{sublabel}</p>
    )}
  </div>
);

const StatsGrid = ({ overview, loading }) => (
  <section>
    <div className="mb-3 flex items-center justify-between sm:mb-4">
      <div>
        <p className="text-xs uppercase tracking-[0.35em] text-primary/80">Overview</p>
        <h2 className="font-heading text-xl text-white sm:text-2xl">Operations at a glance</h2>
      </div>
    </div>

    {loading ? (
      <SkeletonStats />
    ) : (
      <>
        <div className="grid gap-2 sm:gap-4 grid-cols-2 lg:grid-cols-3">
          <StatCard
            label="Total Documents"
            value={overview?.totals?.totalDocuments ?? 0}
            sublabel={`${overview?.categoryBreakdown?.length ?? 0} categories`}
            accent="primary"
            loading={loading}
          />
          <StatCard
            label="Manufacturing"
            value={overview?.totals?.manufacturingCount ?? 0}
            sublabel="MN + MI documents"
            loading={loading}
          />
          <StatCard
            label="Quality"
            value={overview?.totals?.qualityCount ?? 0}
            sublabel="QI + QAN documents"
            accent="quality"
            loading={loading}
          />
        </div>

        {overview?.categoryBreakdown?.length ? (
          <div className="mt-3 flex flex-wrap gap-1 text-xs text-slate-300 sm:mt-5 sm:gap-2">
            {overview.categoryBreakdown.slice(0, 6).map((item) => (
              <span
                key={item.category}
                className="rounded-full border border-white/10 bg-white/5 px-2 py-1 sm:px-3 touch-manipulation tap-highlight transition-transform hover:scale-105 active:scale-95"
              >
                {item.category} · {item.count}
              </span>
            ))}
            {overview.categoryBreakdown.length > 6 && (
              <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1 sm:px-3 touch-manipulation tap-highlight">
                +{overview.categoryBreakdown.length - 6} more
              </span>
            )}
          </div>
        ) : null}
      </>
    )}
  </section>
);

export default StatsGrid;
