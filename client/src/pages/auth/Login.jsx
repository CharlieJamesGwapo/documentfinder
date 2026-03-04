import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import VerificationModal from '../../components/auth/VerificationModal.jsx';
import Footer from '../../components/common/Footer.jsx';

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

  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  return (
    <div className="relative flex min-h-screen flex-col bg-secondary safe-area-top safe-area-bottom touch-manipulation">
      {/* Animated background gradient */}
      <div className="absolute inset-0 opacity-30 pointer-events-none">
        <div className="absolute top-0 left-1/4 h-96 w-96 rounded-full bg-primary/20 blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-0 right-1/4 h-96 w-96 rounded-full bg-primary/10 blur-3xl animate-pulse-slow" style={{animationDelay: '1s'}} />
      </div>

      {/* Main container */}
      <div className="relative flex flex-1 flex-col items-center justify-center px-3 py-4 sm:px-4 sm:py-8 lg:px-8">
        <div className="w-full max-w-md sm:max-w-lg animate-fade-in">
          {/* Card */}
          <div className="rounded-2xl border border-white/10 bg-[#0e0f13]/95 shadow-[0_20px_60px_rgba(0,0,0,0.5)] backdrop-blur-xl sm:rounded-3xl animate-scale-in">
            {/* Header with logo */}
            <div className="border-b border-white/5 px-4 py-4 sm:px-8 sm:py-8 lg:py-10">
              <div className="flex flex-col items-center text-center">
                {/* Tesla Logo */}
                <div className="relative mb-4 sm:mb-6">
                  <div className="absolute inset-0 rounded-full bg-primary/20 blur-xl opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  <img
                    src="/logo.png"
                    alt="Tesla"
                    className="relative h-16 w-16 object-contain sm:h-20 sm:w-20 drop-shadow-lg transition-transform duration-300 hover:scale-110"
                  />
                </div>

                {/* Branding */}
                <p className="text-xs uppercase tracking-[0.4em] text-primary/80 sm:text-sm">Tesla Ops</p>
                <h1 className="mt-2 font-heading text-xl font-bold text-white sm:mt-3 sm:text-2xl lg:text-3xl">
                  Manufacturing & Quality Vault
                </h1>
                <p className="mt-1 text-xs text-slate-400 sm:mt-2 sm:text-sm">
                  Secure access for engineers and QA
                </p>
              </div>
            </div>

            {/* Form */}
            <form className="space-y-3 px-4 py-4 sm:space-y-5 sm:px-8 sm:py-8" onSubmit={handleSubmit}>
              {/* Email Input */}
              <div className="space-y-2">
                <label className="flex items-center justify-between text-xs font-medium text-slate-300 sm:text-sm">
                  <span>Email Address</span>
                  {form.email && (
                    <span className="text-xs text-primary/70">✓ Valid</span>
                  )}
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={form.email}
                    onChange={(event) => handleChange('email', event.target.value)}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                    required
                    autoComplete="email"
                    inputMode="email"
                    className={`w-full rounded-lg border bg-black/30 px-4 py-2.5 text-sm sm:text-base text-white placeholder:text-slate-500 transition-all duration-200 focus:outline-none sm:rounded-xl sm:px-5 sm:py-3.5 touch-manipulation tap-highlight ${
                      focusedField === 'email'
                        ? 'border-primary/60 shadow-lg shadow-primary/20'
                        : 'border-white/10 hover:border-white/20'
                    }`}
                    placeholder="engineer@tesla.com"
                  />
                  {form.email && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-primary">📧</span>
                  )}
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <label className="flex items-center justify-between text-xs font-medium text-slate-300 sm:text-sm">
                  <span>Password</span>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-xs uppercase tracking-[0.2em] text-primary transition hover:text-primary/80"
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={form.password}
                    onChange={(event) => handleChange('password', event.target.value)}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                    required
                    autoComplete="current-password"
                    className={`w-full rounded-lg border bg-black/30 px-4 py-2.5 text-sm sm:text-base text-white placeholder:text-slate-500 transition-all duration-200 focus:outline-none sm:rounded-xl sm:px-5 sm:py-3.5 touch-manipulation tap-highlight ${
                      focusedField === 'password'
                        ? 'border-primary/60 shadow-lg shadow-primary/20'
                        : 'border-white/10 hover:border-white/20'
                    }`}
                    placeholder="••••••••"
                  />
                  {form.password && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-primary">🔒</span>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || !form.email || !form.password}
                className="group relative mt-4 w-full overflow-hidden rounded-lg bg-primary py-2.5 text-xs font-semibold uppercase tracking-[0.3em] text-white shadow-lg shadow-primary/30 transition-all duration-300 hover:shadow-xl hover:shadow-primary/50 disabled:cursor-not-allowed disabled:opacity-50 active:scale-95 sm:rounded-xl sm:py-3.5 sm:text-sm touch-manipulation tap-highlight"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-white/20 to-primary/0 translate-x-full group-hover:translate-x-0 transition-transform duration-500" />
                <span className="relative flex items-center justify-center gap-2">
                  {loading ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Authenticating…
                    </>
                  ) : (
                    <>
                      Enter Vault
                      <span className="transition-transform group-hover:translate-x-1">→</span>
                    </>
                  )}
                </span>
              </button>

              {/* Divider */}
              <div className="relative my-4 sm:my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10" />
                </div>
                <div className="relative flex justify-center text-xs text-slate-500">
                  <span className="bg-[#0e0f13] px-2">or</span>
                </div>
              </div>

              {/* Sign Up Link */}
              <div className="text-center">
                <p className="text-xs text-slate-400 sm:text-sm">
                  Need access?{' '}
                  <Link
                    to="/register"
                    className="font-semibold text-primary transition-all hover:text-primary/80 hover:underline underline-offset-2"
                  >
                    Create an account
                  </Link>
                </p>
              </div>
            </form>

            {/* Footer */}
            <div className="border-t border-white/5 px-4 py-4 sm:px-8 sm:py-5">
              <p className="text-center text-xs text-slate-500">
                🔐 Secure JWT authentication • Role-based access
              </p>
            </div>
          </div>

          {/* Info Box - Mobile optimized */}
          <div className="mt-3 rounded-lg border border-white/10 bg-black/30 p-2.5 backdrop-blur sm:mt-6 sm:rounded-xl sm:p-4 animate-slide-up">
            <p className="text-2xs sm:text-xs text-slate-400">
              <span className="font-semibold text-primary">💡 Demo Credentials:</span> Use your registered email and password to access the vault.
            </p>
          </div>
        </div>
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

      <Footer />
    </div>
  );
};

export default Login;
