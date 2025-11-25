import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import logo from '../../assets/tesla.jpg';
import VerificationModal from '../../components/auth/VerificationModal.jsx';

const Login = () => {
  const navigate = useNavigate();
  const { login, verifyOtp, resendOtp } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [otpState, setOtpState] = useState({ open: false, email: '', code: '', verifying: false, resending: false });

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      const result = await login(form);
      if (result?.requiresVerification) {
        setOtpState((prev) => ({ ...prev, open: true, email: result.email, code: '' }));
        return;
      }

      if (result?.success) {
        navigate('/');
      }
    } catch (error) {
      // toast from context will handle errors
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otpState.email || otpState.code.length !== 6) return;
    setOtpState((prev) => ({ ...prev, verifying: true }));
    try {
      await verifyOtp({ email: otpState.email, code: otpState.code });
      setOtpState({ open: false, email: '', code: '', verifying: false, resending: false });
      navigate('/');
    } catch (error) {
      // toast shows error
    } finally {
      setOtpState((prev) => ({ ...prev, verifying: false }));
    }
  };

  const handleResendOtp = async () => {
    if (!otpState.email) return;
    setOtpState((prev) => ({ ...prev, resending: true }));
    try {
      await resendOtp(otpState.email);
    } catch (error) {
      // toast already displayed
    } finally {
      setOtpState((prev) => ({ ...prev, resending: false }));
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary px-4">
      <div className="w-full max-w-xl rounded-3xl border border-white/5 bg-[#15161b]/95 p-10 shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
        <div className="mb-8 flex flex-col items-center text-center">
          <img src={logo} alt="Tesla" className="h-16 w-16 rounded-full border border-white/10 object-cover" />
          <p className="mt-4 text-xs uppercase tracking-[0.35em] text-primary/80">Tesla Ops</p>
          <h1 className="font-heading text-3xl text-white">Manufacturing & Quality Vault</h1>
          <p className="text-sm text-slate-400">Secure access for engineers and QA</p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <label className="space-y-2 text-sm">
            <span className="text-slate-300">Email</span>
            <input
              type="email"
              value={form.email}
              onChange={(event) => handleChange('email', event.target.value)}
              required
              className="w-full rounded-2xl border border-white/5 bg-black/30 px-4 py-3 text-white placeholder:text-slate-500 focus:border-primary focus:outline-none"
              placeholder="engineer@tesla.com"
            />
          </label>

          <label className="space-y-2 text-sm">
            <span className="text-slate-300">Password</span>
            <input
              type="password"
              value={form.password}
              onChange={(event) => handleChange('password', event.target.value)}
              required
              className="w-full rounded-2xl border border-white/5 bg-black/30 px-4 py-3 text-white placeholder:text-slate-500 focus:border-primary focus:outline-none"
              placeholder="••••••••"
            />
          </label>

          <div className="space-y-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-primary py-3 text-sm font-semibold uppercase tracking-[0.35em] text-white shadow-glow transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? 'Authenticating…' : 'Enter Vault'}
            </button>
            <p className="text-center text-sm text-slate-400">
              Need access?{' '}
              <Link to="/register" className="text-primary underline-offset-4 hover:underline">
                Create an account
              </Link>
            </p>
          </div>
        </form>
      </div>

      <VerificationModal
        open={otpState.open}
        email={otpState.email}
        code={otpState.code}
        onCodeChange={(value) => setOtpState((prev) => ({ ...prev, code: value }))}
        onVerify={handleVerifyOtp}
        onResend={handleResendOtp}
        verifying={otpState.verifying}
        resending={otpState.resending}
        onClose={() => setOtpState({ open: false, email: '', code: '', verifying: false, resending: false })}
      />
    </div>
  );
};

export default Login;
