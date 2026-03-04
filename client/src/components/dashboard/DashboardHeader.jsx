import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';

const DashboardHeader = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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
    setMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
    setMenuOpen(false);
  };

  const closeAllMenus = () => {
    setMenuOpen(false);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-[#0b0c10]/95 backdrop-blur-xl transition-all duration-300 safe-area-top">
      <div className="mx-auto w-full px-2 py-2.5 sm:px-4 sm:py-3 md:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-2 sm:gap-3 md:gap-4">
          {/* Logo Section - Responsive */}
          <Link to="/" className="flex flex-shrink-0 items-center gap-1.5 transition hover:opacity-90 sm:gap-2 md:gap-3" onClick={closeAllMenus}>
            <img 
              src="/logo.png" 
              alt="Document Finder" 
              className="h-8 w-8 object-contain sm:h-9 sm:w-9 md:h-10 md:w-10"
            />
            <div className="hidden flex-col sm:flex">
              <p className="text-xs font-bold uppercase tracking-widest text-white sm:text-xs md:text-sm">Document Finder</p>
              <p className="text-xs font-semibold text-primary">Powered by Tesla</p>
            </div>
          </Link>

          {/* Mobile Menu Button - Visible only on small screens */}
          <button
            onClick={toggleMobileMenu}
            className="flex items-center justify-center rounded-lg border border-white/10 bg-white/5 p-2 transition hover:bg-white/10 md:hidden touch-manipulation tap-highlight"
            aria-label="Toggle menu"
          >
            <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>

          {/* Center - Desktop Navigation - Hidden on Mobile */}
          <nav className="hidden items-center gap-4 md:flex lg:gap-6">
            <Link to="/" className="text-xs font-medium text-slate-300 transition hover:text-white md:text-sm">
              Dashboard
            </Link>
            <a href="#" className="text-xs font-medium text-slate-300 transition hover:text-white md:text-sm">
              Documents
            </a>
            <a href="#" className="text-xs font-medium text-slate-300 transition hover:text-white md:text-sm">
              Help
            </a>
          </nav>

          {/* Right Section - Clock and User Menu - Responsive */}
          <div className="hidden items-center gap-1.5 sm:gap-2 md:gap-3 lg:gap-4 md:flex">
            {/* Time Display - Hidden on Small Mobile */}
            <div className="hidden flex-col items-end text-right sm:flex">
              <p className="text-xs font-mono font-bold text-primary md:text-sm">{getNevadasTime()}</p>
              <p className="hidden text-xs text-slate-400 md:block">{getNevadasDate()}</p>
            </div>

            {/* User Menu Button - Responsive */}
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-1.5 py-1 transition hover:bg-white/10 sm:gap-2 sm:px-2.5 sm:py-1.5 md:px-3 md:py-2 touch-manipulation tap-highlight"
              >
                {user?.photoUrl ? (
                  <img
                    src={user.photoUrl}
                    alt={user.name}
                    className="h-6 w-6 rounded-full border border-primary/30 object-cover sm:h-7 sm:w-7 md:h-8 md:w-8"
                  />
                ) : (
                  <div className="flex h-6 w-6 items-center justify-center rounded-full border border-primary/30 bg-gradient-to-br from-primary/20 to-primary/10 sm:h-7 sm:w-7 md:h-8 md:w-8">
                    <span className="text-xs font-bold text-primary md:text-sm">
                      {user?.firstName?.[0]}{user?.lastName?.[0]}
                    </span>
                  </div>
                )}
                <span className="hidden text-xs font-semibold text-white sm:inline md:text-sm">{user?.firstName}</span>
                <svg
                  className={`h-3 w-3 text-slate-400 transition sm:h-4 sm:w-4 ${menuOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </button>

              {/* Dropdown Menu - Mobile Optimized */}
              {menuOpen && (
                <div className="absolute right-0 top-full z-50 mt-2 w-44 rounded-xl border border-white/10 bg-[#15161b]/95 shadow-xl backdrop-blur-xl sm:w-48 md:w-56 md:rounded-2xl animate-slide-down">
                  <div className="border-b border-white/5 p-2.5 sm:p-3 md:p-4">
                    <p className="truncate text-xs font-semibold text-white sm:text-sm">{user?.name}</p>
                    <p className="truncate text-xs text-slate-400">{user?.email}</p>
                    <div className="mt-2 inline-block rounded-full bg-primary/10 px-2 py-1 text-xs font-semibold uppercase text-primary">
                      {user?.role}
                    </div>
                  </div>

                  <div className="space-y-0.5 p-1.5 sm:p-2">
                    <button
                      onClick={() => {
                        navigate('/profile');
                        setMenuOpen(false);
                      }}
                      className="w-full rounded-lg px-2.5 py-1.5 text-left text-xs font-medium text-slate-300 transition hover:bg-white/5 hover:text-white sm:px-3 sm:py-2 md:text-sm touch-manipulation"
                    >
                      👤 My Profile
                    </button>
                    <button
                      onClick={() => {
                        navigate('/profile');
                        setMenuOpen(false);
                      }}
                      className="w-full rounded-lg px-2.5 py-1.5 text-left text-xs font-medium text-slate-300 transition hover:bg-white/5 hover:text-white sm:px-3 sm:py-2 md:text-sm touch-manipulation"
                    >
                      ⚙️ Settings
                    </button>
                    <button
                      onClick={() => {
                        navigate('/');
                        setMenuOpen(false);
                      }}
                      className="w-full rounded-lg px-2.5 py-1.5 text-left text-xs font-medium text-slate-300 transition hover:bg-white/5 hover:text-white sm:px-3 sm:py-2 md:text-sm touch-manipulation"
                    >
                      📊 Dashboard
                    </button>
                  </div>

                  <div className="border-t border-white/5 p-1.5 sm:p-2">
                    <button
                      onClick={handleLogout}
                      className="w-full rounded-lg px-2.5 py-1.5 text-left text-xs font-medium text-red-400 transition hover:bg-red-500/10 sm:px-3 sm:py-2 md:text-sm touch-manipulation"
                    >
                      🚪 Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay - Full screen on mobile */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
            onClick={closeAllMenus}
          />
          
          {/* Menu Panel */}
          <div className="absolute right-0 top-0 h-full w-80 max-w-[85vw] bg-[#15161b] shadow-xl animate-slide-left safe-area-top safe-area-bottom">
            <div className="flex h-full flex-col">
              {/* Mobile Menu Header */}
              <div className="flex items-center justify-between border-b border-white/10 p-4">
                <div className="flex items-center gap-3">
                  {user?.photoUrl ? (
                    <img
                      src={user.photoUrl}
                      alt={user.name}
                      className="h-10 w-10 rounded-full border border-primary/30 object-cover"
                    />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-full border border-primary/30 bg-gradient-to-br from-primary/20 to-primary/10">
                      <span className="text-sm font-bold text-primary">
                        {user?.firstName?.[0]}{user?.lastName?.[0]}
                      </span>
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-semibold text-white">{user?.name}</p>
                    <p className="text-xs text-slate-400">{user?.email}</p>
                  </div>
                </div>
                <button
                  onClick={closeAllMenus}
                  className="rounded-lg p-2 text-slate-400 transition hover:text-white touch-manipulation tap-highlight"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Mobile Menu Navigation */}
              <nav className="flex-1 overflow-y-auto p-4">
                <div className="space-y-2">
                  <Link
                    to="/"
                    onClick={closeAllMenus}
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-white/5 hover:text-white touch-manipulation"
                  >
                    📊 Dashboard
                  </Link>
                  <a
                    href="#"
                    onClick={closeAllMenus}
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-white/5 hover:text-white touch-manipulation"
                  >
                    📁 Documents
                  </a>
                  <a
                    href="#"
                    onClick={closeAllMenus}
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-white/5 hover:text-white touch-manipulation"
                  >
                    ❓ Help
                  </a>
                  <div className="border-t border-white/10 my-4" />
                  <Link
                    to="/profile"
                    onClick={closeAllMenus}
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-white/5 hover:text-white touch-manipulation"
                  >
                    👤 My Profile
                  </Link>
                  <button
                    onClick={() => {
                      navigate('/profile');
                      closeAllMenus();
                    }}
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-slate-300 transition hover:bg-white/5 hover:text-white touch-manipulation w-full"
                  >
                    ⚙️ Settings
                  </button>
                </div>
              </nav>

              {/* Mobile Menu Footer */}
              <div className="border-t border-white/10 p-4">
                <div className="mb-4 text-center">
                  <p className="text-xs font-mono font-bold text-primary">{getNevadasTime()}</p>
                  <p className="text-xs text-slate-400">{getNevadasDate()}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm font-medium text-red-400 transition hover:bg-red-500/20 touch-manipulation"
                >
                  🚪 Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default DashboardHeader;
