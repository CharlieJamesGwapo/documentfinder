const LoadingScreen = () => (
  <div className="flex h-screen w-full flex-col items-center justify-center gap-4 bg-secondary text-white">
    <div className="h-16 w-16 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    <p className="font-heading text-lg tracking-[0.3em] text-slate-300">Synchronizing</p>
  </div>
);

export default LoadingScreen;
