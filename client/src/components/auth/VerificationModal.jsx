const VerificationModal = ({
  open,
  email,
  code,
  onCodeChange,
  onVerify,
  onResend,
  verifying,
  resending,
  onClose
}) => {
  if (!open) return null;

  const handleSubmit = (event) => {
    event.preventDefault();
    onVerify?.();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-6 sm:px-6">
      <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-[#0e0f13] p-6 shadow-[0_40px_120px_rgba(0,0,0,0.65)] sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <p className="text-xs uppercase tracking-[0.4em] text-primary/70">Verify access</p>
            <h2 className="mt-2 font-heading text-2xl text-white sm:text-3xl">Enter your code</h2>
            <p className="mt-2 text-sm text-slate-400">
              We emailed a six-digit code to{' '}
              <span className="block font-semibold text-white sm:inline">{email}</span>.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex-shrink-0 text-slate-500 transition hover:text-white"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <label className="space-y-3 text-sm">
            <span className="text-slate-300">One-time passcode</span>
            <input
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              value={code}
              onChange={(event) => onCodeChange(event.target.value.replace(/\D/g, ''))}
              autoComplete="one-time-code"
              className="w-full rounded-2xl border border-white/10 bg-black/40 px-6 py-4 text-center text-2xl tracking-[0.6em] text-white transition focus:border-primary focus:outline-none"
              placeholder="000000"
              required
            />
            <p className="text-xs text-slate-500">Codes expire after 15 minutes. Request a new one if needed.</p>
          </label>

          <button
            type="submit"
            disabled={verifying || code.length !== 6}
            className="w-full rounded-2xl bg-primary py-3 text-sm font-semibold uppercase tracking-[0.4em] text-white shadow-lg shadow-primary/30 transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {verifying ? 'Verifying…' : 'Verify account'}
          </button>
        </form>

        <div className="mt-6 flex flex-col items-center justify-between gap-4 text-sm text-slate-400 sm:flex-row">
          <p>Didn't receive the email?</p>
          <button
            type="button"
            onClick={onResend}
            disabled={resending}
            className="text-primary transition hover:text-primary/80 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {resending ? 'Sending…' : 'Resend code'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerificationModal;
