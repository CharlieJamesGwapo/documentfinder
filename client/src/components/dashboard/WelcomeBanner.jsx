import { useAuth } from '../../context/AuthContext.jsx';

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
};

const WelcomeBanner = ({ overview, onOpenSearch }) => {
  const { user } = useAuth();
  const firstName = user?.firstName || 'there';
  const totalDocs = overview?.totals?.totalDocuments || 0;
  const storage = overview?.storageBytes || 0;
  const storageMB = (storage / (1024 * 1024)).toFixed(1);

  return (
    <div className="rounded-2xl border border-white/5 bg-gradient-to-r from-primary/10 via-[#15161b] to-[#15161b] p-4 sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-xl text-white sm:text-2xl lg:text-3xl">
            {getGreeting()}, <span className="text-primary">{firstName}</span>
          </h1>
          <p className="mt-1 text-xs text-slate-400 sm:text-sm">
            {totalDocs > 0
              ? `${totalDocs} document${totalDocs !== 1 ? 's' : ''} in your vault · ${storageMB} MB storage used`
              : 'Your vault is empty. Start by uploading documents or loading sample data.'}
          </p>
        </div>
        <button
          type="button"
          onClick={onOpenSearch}
          className="hidden sm:inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs text-slate-400 transition hover:border-primary/30 hover:bg-white/10 hover:text-white"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <span>Quick search</span>
          <kbd className="ml-2 rounded border border-white/10 bg-white/5 px-1.5 py-0.5 text-[0.6rem] text-slate-500">Ctrl+K</kbd>
        </button>
      </div>
    </div>
  );
};

export default WelcomeBanner;
