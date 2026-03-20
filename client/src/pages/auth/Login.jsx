import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import VerificationModal from '../../components/auth/VerificationModal.jsx';
import Footer from '../../components/common/Footer.jsx';

const MovingCar = ({ cardRef }) => {
  const carRef = useRef(null);
  const animRef = useRef(null);
  const progressRef = useRef(0);

  useEffect(() => {
    const car = carRef.current;
    const card = cardRef.current;
    if (!car || !card) return;

    const carWidth = 80;
    const carHeight = 40;
    const speed = 0.15; // percent per frame

    const animate = () => {
      const rect = card.getBoundingClientRect();
      const parentRect = card.parentElement.getBoundingClientRect();
      const relX = rect.left - parentRect.left;
      const relY = rect.top - parentRect.top;
      const w = rect.width;
      const h = rect.height;

      // Perimeter segments: top, right, bottom, left
      const perimeter = 2 * (w + h);
      const p = progressRef.current % 100;
      const dist = (p / 100) * perimeter;

      let x, y, rotation;

      if (dist <= w) {
        // Top edge: left to right
        x = relX + dist - carWidth / 2;
        y = relY - carHeight / 2;
        rotation = 0;
      } else if (dist <= w + h) {
        // Right edge: top to bottom
        const d = dist - w;
        x = relX + w - carWidth / 2;
        y = relY + d - carHeight / 2;
        rotation = 90;
      } else if (dist <= 2 * w + h) {
        // Bottom edge: right to left
        const d = dist - w - h;
        x = relX + w - d - carWidth / 2;
        y = relY + h - carHeight / 2;
        rotation = 180;
      } else {
        // Left edge: bottom to top
        const d = dist - 2 * w - h;
        x = relX - carWidth / 2;
        y = relY + h - d - carHeight / 2;
        rotation = 270;
      }

      car.style.transform = `translate(${x}px, ${y}px) rotate(${rotation}deg)`;
      progressRef.current = (progressRef.current + speed) % 100;
      animRef.current = requestAnimationFrame(animate);
    };

    animRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animRef.current);
  }, [cardRef]);

  return (
    <img
      ref={carRef}
      src="/teslacar.jpg"
      alt=""
      className="pointer-events-none absolute z-20"
      style={{
        width: '80px',
        height: '40px',
        objectFit: 'cover',
        borderRadius: '6px',
        filter: 'drop-shadow(0 0 8px rgba(232, 33, 39, 0.6))',
      }}
    />
  );
};

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
        title: 'Verification Successful!',
        html: `
          <div style="text-align: center; color: #cbd5f5;">
            <p style="margin: 12px 0; font-size: 15px;">Your account has been verified.</p>
            <div style="background: #0f1118; border-left: 3px solid #e82127; padding: 12px; border-radius: 6px; margin: 16px 0;">
              <p style="margin: 0; font-size: 14px; color: #e82127;">You can now access the dashboard</p>
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
  const cardRef = useRef(null);

  return (
    <div className="relative flex min-h-screen flex-col bg-secondary safe-area-top safe-area-bottom touch-manipulation">
      {/* Main container */}
      <div className="flex flex-1 flex-col items-center justify-center px-3 py-4 sm:px-4 sm:py-8 lg:px-8">
        <div className="relative w-full max-w-md sm:max-w-lg animate-fade-in">
          <MovingCar cardRef={cardRef} />
          {/* Card */}
          <div ref={cardRef} className="rounded-2xl border border-white/10 bg-[#0e0f13]/95 shadow-[0_20px_60px_rgba(0,0,0,0.5)] backdrop-blur-xl sm:rounded-3xl animate-scale-in">
            {/* Header with logo */}
            <div className="border-b border-white/5 px-4 py-4 sm:px-8 sm:py-8 lg:py-10">
              <div className="flex flex-col items-center text-center">
                {/* Tesla Logo */}
                <div className="mb-4 sm:mb-6">
                  <img
                    src="/logo.png"
                    alt="Tesla"
                    className="h-16 w-16 object-contain sm:h-20 sm:w-20"
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
                    <span className="text-xs text-primary/70">Valid</span>
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
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || !form.email || !form.password}
                className="group relative mt-4 w-full overflow-hidden rounded-lg bg-primary py-2.5 text-xs font-semibold uppercase tracking-[0.3em] text-white shadow-lg shadow-primary/30 transition-all duration-300 hover:shadow-xl hover:shadow-primary/50 disabled:cursor-not-allowed disabled:opacity-50 active:scale-95 sm:rounded-xl sm:py-3.5 sm:text-sm touch-manipulation tap-highlight"
              >
                <span className="flex items-center justify-center gap-2">
                  {loading ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Authenticating…
                    </>
                  ) : (
                    'Sign In'
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
                Secure JWT authentication | Role-based access
              </p>
            </div>
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
