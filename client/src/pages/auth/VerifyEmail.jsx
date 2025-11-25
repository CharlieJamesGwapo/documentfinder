import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../lib/api';
import logo from '../../assets/tesla.jpg';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const token = searchParams.get('token');
        const email = searchParams.get('email');

        if (!token || !email) {
          setError('Invalid verification link');
          setLoading(false);
          return;
        }

        console.log('🔗 Verifying email with token:', token.substring(0, 10) + '...');
        
        const response = await api.get('/auth/verify-email', {
          params: { token, email }
        });

        console.log('✅ Email verified:', response.data);
        
        if (response.data.token) {
          localStorage.setItem('token', response.data.token);
        }

        setVerified(true);
        toast.success('Account verified successfully!');

        // Redirect to dashboard after 2 seconds
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      } catch (err) {
        console.error('❌ Verification error:', err);
        const message = err.response?.data?.message || 'Unable to verify email';
        setError(message);
        toast.error(message);
        setLoading(false);
      }
    };

    verifyEmail();
  }, [searchParams, navigate]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-secondary px-4 py-10">
      <div className="w-full max-w-md rounded-[32px] border border-white/5 bg-[#0e0f13]/95 p-8 shadow-[0_30px_120px_rgba(0,0,0,0.5)]">
        <div className="mb-8 flex flex-col items-center text-center">
          <img src={logo} alt="Tesla" className="h-14 w-14 rounded-full border border-white/10 object-cover" />
          <p className="mt-3 text-xs uppercase tracking-[0.35em] text-primary/80">Tesla Ops</p>
          <h1 className="font-heading text-2xl text-white">Email Verification</h1>
        </div>

        {loading ? (
          <div className="space-y-4">
            <div className="flex justify-center">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-white/10 border-t-primary" />
            </div>
            <p className="text-center text-sm text-slate-400">Verifying your account...</p>
          </div>
        ) : verified ? (
          <div className="space-y-4">
            <div className="flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/20 border border-primary/50">
                <span className="text-2xl">✓</span>
              </div>
            </div>
            <div className="text-center">
              <p className="font-semibold text-white">Account Verified!</p>
              <p className="mt-2 text-sm text-slate-400">Your email has been verified successfully.</p>
              <p className="mt-4 text-xs text-slate-500">Redirecting to dashboard...</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500/20 border border-red-500/50">
                <span className="text-2xl">✕</span>
              </div>
            </div>
            <div className="text-center">
              <p className="font-semibold text-white">Verification Failed</p>
              <p className="mt-2 text-sm text-slate-400">{error}</p>
              <button
                onClick={() => navigate('/login')}
                className="mt-6 w-full rounded-xl bg-primary py-3 text-sm font-semibold uppercase tracking-wide text-white transition hover:bg-primary/90"
              >
                Back to Login
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
