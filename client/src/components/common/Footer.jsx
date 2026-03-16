import { useState, useEffect } from 'react';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <footer className="relative border-t border-white/5 bg-gradient-to-b from-[#0a0b10] to-[#050607] backdrop-blur-xl">
      <div className="px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-4 sm:gap-3">
            <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
              <div className="flex items-center gap-2">
                <img src="/logo.png" alt="Document Finder Logo" className="h-6 w-6 object-contain" />
                <span className="text-xs font-bold uppercase tracking-[0.3em] text-primary">Tesla Ops</span>
                <span className="text-xs text-slate-500">Document Finder</span>
              </div>
              <p className="text-xs text-slate-600">
                Designed by <span className="text-slate-400 font-medium">Melanie Birmingham</span> · Quality Engineering
              </p>
            </div>

            <div className="border-t border-white/5 pt-3 text-center">
              <p className="text-xs text-slate-500">
                © {currentYear} Tesla Manufacturing & Quality Vault. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll to Top - positioned above AI button on mobile */}
      {showScrollTop && (
        <div className="fixed bottom-[5.5rem] right-4 z-30 sm:bottom-6 sm:right-6">
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-[#15161b]/90 text-sm text-slate-300 shadow-lg transition hover:bg-primary hover:text-white hover:border-primary/50 backdrop-blur-sm sm:h-10 sm:w-10 touch-manipulation active:scale-95"
            aria-label="Scroll to top"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
          </button>
        </div>
      )}
    </footer>
  );
};

export default Footer;
