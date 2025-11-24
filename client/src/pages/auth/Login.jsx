import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import logo from '../../assets/tesla.jpg';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      await login(form);
      navigate('/');
    } catch (error) {
      // toast from context will handle errors
    } finally {
      setLoading(false);
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

          <button
            type="submit"
            disabled={loading}
            className="mt-4 w-full rounded-2xl bg-primary py-3 text-sm font-semibold uppercase tracking-[0.35em] text-white shadow-glow transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? 'Authenticating…' : 'Enter Vault'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
