import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import logo from '../../assets/tesla.jpg';

const DashboardHeader = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every second (Nevada PST timezone)
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Format time in Nevada PST (UTC-8 or UTC-7 during DST)
  const getNevadasTime = () => {
    const options = {
      timeZone: 'America/Los_Angeles',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    };
    return currentTime.toLocaleTimeString('en-US', options);
  };

  const getNevadasDate = () => {
    const options = {
      timeZone: 'America/Los_Angeles',
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    };
    return currentTime.toLocaleDateString('en-US', options);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    setMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-[#0b0c10]/95 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {/* Logo and Time */}
          <div className="flex items-center justify-between gap-4">
            <Link to="/" className="flex items-center gap-3 transition hover:opacity-90">
              {/* Logo Badge */}
              <div className="flex h-11 w-11 items-center justify-center rounded-lg border-2 border-primary bg-gradient-to-br from-primary/40 to-primary/20 shadow-lg shadow-primary/20 sm:h-12 sm:w-12">
                <span className="font-heading text-lg font-bold text-white sm:text-xl">T</span>
              </div>
              {/* Branding Text */}
              <div className="hidden flex-col sm:flex">
                <p className="text-sm font-bold uppercase tracking-widest text-white">Tesla Ops</p>
                <p className="text-xs font-semibold text-primary">Document Finder</p>
              </div>
            </Link>

            {/* Real-time Nevada Clock - Mobile */}
            <div className="flex flex-col items-end text-right sm:hidden">
              <p className="text-xs font-mono font-bold text-primary">{getNevadasTime()}</p>
              <p className="text-xs text-slate-400">Nevada</p>
            </div>
          </div>

          {/* Desktop Navigation and Clock */}
          <div className="flex items-center justify-between gap-4 sm:gap-8">
            <nav className="hidden items-center gap-6 md:flex">
              <Link to="/" className="text-sm font-medium text-slate-300 transition hover:text-white">
                Dashboard
              </Link>
              <a href="#" className="text-sm font-medium text-slate-300 transition hover:text-white">
                Documents
              </a>
              <a href="#" className="text-sm font-medium text-slate-300 transition hover:text-white">
                Help
              </a>
            </nav>

            {/* Real-time Nevada Clock - Desktop */}
            <div className="hidden flex-col items-end text-right sm:flex">
              <p className="text-xs font-mono font-bold text-primary">{getNevadasTime()}</p>
              <p className="text-xs text-slate-400">{getNevadasDate()}</p>
            </div>
          </div>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2 transition hover:bg-white/10"
            >
              {user?.photoUrl ? (
                <img
                  src={user.photoUrl}
                  alt={user.name}
                  className="h-8 w-8 rounded-full border border-primary/30 object-cover"
                />
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-full border border-primary/30 bg-gradient-to-br from-primary/20 to-primary/10">
                  <span className="text-xs font-bold text-primary">
                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                  </span>
                </div>
              )}
              <span className="hidden text-sm font-semibold text-white sm:inline">{user?.firstName}</span>
              <svg
                className={`h-4 w-4 text-slate-400 transition ${menuOpen ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </button>

            {/* Dropdown Menu */}
            {menuOpen && (
              <div className="absolute right-0 top-full z-50 mt-2 w-56 rounded-2xl border border-white/10 bg-[#15161b]/95 shadow-xl backdrop-blur-xl sm:w-64">
                <div className="border-b border-white/5 p-4">
                  <p className="text-sm font-semibold text-white">{user?.name}</p>
                  <p className="text-xs text-slate-400">{user?.email}</p>
                  <div className="mt-2 inline-block rounded-full bg-primary/10 px-2 py-1 text-xs font-semibold uppercase text-primary">
                    {user?.role}
                  </div>
                </div>

                <div className="space-y-1 p-2">
                  <button
                    onClick={() => {
                      navigate('/profile');
                      setMenuOpen(false);
                    }}
                    className="w-full rounded-lg px-4 py-2 text-left text-sm font-medium text-slate-300 transition hover:bg-white/5 hover:text-white"
                  >
                    👤 My Profile
                  </button>
                  <button
                    onClick={() => {
                      navigate('/profile');
                      setMenuOpen(false);
                    }}
                    className="w-full rounded-lg px-4 py-2 text-left text-sm font-medium text-slate-300 transition hover:bg-white/5 hover:text-white"
                  >
                    ⚙️ Settings
                  </button>
                  <button
                    onClick={() => {
                      navigate('/');
                      setMenuOpen(false);
                    }}
                    className="w-full rounded-lg px-4 py-2 text-left text-sm font-medium text-slate-300 transition hover:bg-white/5 hover:text-white"
                  >
                    📊 Dashboard
                  </button>
                </div>

                <div className="border-t border-white/5 p-2">
                  <button
                    onClick={handleLogout}
                    className="w-full rounded-lg px-4 py-2 text-left text-sm font-medium text-red-400 transition hover:bg-red-500/10"
                  >
                    🚪 Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
