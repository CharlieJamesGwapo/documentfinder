import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import logo from '../../assets/main.png';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-secondary text-white">
      <header className="sticky top-0 z-40 border-b border-white/5 bg-gradient-to-r from-[#0b0c10]/95 via-[#111216]/80 to-[#0b0c10]/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 md:flex-row md:items-center md:justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-black/40 p-[6px]">
              <img src={logo} alt="Tesla" className="h-full w-full object-contain" />
            </div>
            <div>
              <p className="font-heading text-lg uppercase tracking-[0.55em] text-white">Tesla</p>
              <p className="text-xs uppercase tracking-[0.4em] text-slate-400">Manufacturing · Quality Vault</p>
            </div>
          </Link>

          {user && (
            <div className="flex items-center gap-4 rounded-full border border-white/10 bg-black/20 px-4 py-2 text-sm">
              <div className="text-right">
                <p className="font-semibold text-white">{user.name}</p>
                <p className="text-xs uppercase tracking-[0.4em] text-slate-400">{user.role === 'admin' ? 'Admin' : 'Engineer'}</p>
              </div>
              <button
                type="button"
                onClick={logout}
                className="rounded-full border border-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white transition hover:border-primary hover:bg-primary/10"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-8 lg:flex-row">
        {children}
      </main>
    </div>
  );
};

export default Layout;
