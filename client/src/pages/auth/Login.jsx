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
      
      // Check if verification is required
      if (result?.requiresVerification) {
        setOtpState((prev) => ({ 
          ...prev, 
          open: true, 
          email: result.email, 
          code: '' 
        }));
        return;
      }

      // If login successful, navigate to dashboard
      if (result?.success) {
        navigate('/');
      }
    } catch (error) {
      // Check if error is due to unverified account (403)
      if (error.response?.status === 403 && error.response?.data?.requiresVerification) {
        setOtpState((prev) => ({ 
          ...prev, 
          open: true, 
          email: error.response.data.email || form.email, 
          code: '' 
        }));
        return;
      }
      // Other errors are handled by toast in context
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
      
      // Show success message and close modal
      const Swal = (await import('sweetalert2')).default;
      await Swal.fire({
        icon: 'success',
        title: '✅ Verification Successful!',
        html: `
          <div style="text-align: center; color: #cbd5f5;">
            <p style="margin: 12px 0; font-size: 15px;">Your account has been verified.</p>
            <div style="background: #0f1118; border-left: 3px solid #10b981; padding: 12px; border-radius: 6px; margin: 16px 0;">
              <p style="margin: 0; font-size: 14px; color: #10b981;">✓ You can now access the dashboard</p>
            </div>
            <p style="margin: 12px 0; font-size: 12px; color: #546389;">Redirecting to dashboard...</p>
          </div>
        `,
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false,
        allowOutsideClick: false,
        allowEscapeKey: false
      });
      
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
    <div className="flex min-h-screen flex-col items-center justify-center bg-secondary px-4 py-8">
      <div className="w-full max-w-xl rounded-3xl border border-white/5 bg-[#15161b]/95 p-8 shadow-[0_20px_60px_rgba(0,0,0,0.45)] sm:p-10">
        <div className="mb-8 flex flex-col items-center text-center">
          <img src={logo} alt="Tesla" className="h-14 w-14 rounded-full border border-white/10 object-cover sm:h-16 sm:w-16" />
          <p className="mt-4 text-xs uppercase tracking-[0.35em] text-primary/80">Tesla Ops</p>
          <h1 className="font-heading text-2xl text-white sm:text-3xl">Manufacturing & Quality Vault</h1>
          <p className="mt-2 text-sm text-slate-400">Secure access for engineers and QA</p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <label className="space-y-2 text-sm">
            <span className="text-slate-300">Email</span>
            <input
              type="email"
              value={form.email}
              onChange={(event) => handleChange('email', event.target.value)}
              required
              autoComplete="email"
              className="w-full rounded-2xl border border-white/5 bg-black/30 px-4 py-3 text-white placeholder:text-slate-500 transition focus:border-primary focus:outline-none"
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
              autoComplete="current-password"
              className="w-full rounded-2xl border border-white/5 bg-black/30 px-4 py-3 text-white placeholder:text-slate-500 transition focus:border-primary focus:outline-none"
              placeholder="••••••••"
            />
          </label>

          <div className="space-y-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-primary py-3 text-sm font-semibold uppercase tracking-[0.35em] text-white shadow-lg shadow-primary/30 transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Authenticating…' : 'Enter Vault'}
            </button>
            <div className="flex flex-col gap-3 text-center text-sm text-slate-400 sm:flex-row sm:items-center sm:justify-between">
              <p>
                Need access?{' '}
                <Link to="/register" className="text-primary transition hover:text-primary/80">
                  Create an account
                </Link>
              </p>
            </div>
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
