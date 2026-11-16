import { User as UserIcon } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Logo from './Logo';
import { User } from '../../lib/dataService';

interface NavbarProps {
  user: User | null;
  onAuthClick: () => void;
}

const NAV_ITEMS = [
  { num: '01', id: 'products', label: 'How it Works' },
  { num: '02', id: 'why-reviews', label: 'Optimization' },
  { num: '03', id: 'eco-friendly', label: 'Eco' },
  { num: '04', id: 'custom-quote', label: 'Quote' },
  { num: '05', id: 'faq', label: 'FAQ' },
  { num: '06', id: 'contact', label: 'Contact' },
];

export default function Navbar({ user, onAuthClick }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isOpen) {
      document.body.style.overflow = '';
      return;
    }

    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        setIsOpen(false);
        setHoveredIndex(null);
        triggerRef.current?.focus();
        return;
      }

      if (e.key === 'Tab') {
        const overlayFocusable: HTMLElement[] = overlayRef.current
          ? (
            Array.from(
              overlayRef.current.querySelectorAll('a[href], button:not([disabled])')
            ) as HTMLElement[]
          ).filter((el) => el.offsetParent !== null)
          : [];

        const focusables = [triggerRef.current, ...overlayFocusable].filter(
          (el): el is HTMLElement => el !== null
        );

        if (focusables.length === 0) return;

        const currentIndex = focusables.indexOf(document.activeElement as HTMLElement);
        e.preventDefault();

        if (currentIndex === -1) {
          focusables[e.shiftKey ? focusables.length - 1 : 0].focus();
        } else {
          const nextIndex =
            (currentIndex + (e.shiftKey ? -1 : 1) + focusables.length) % focusables.length;
          focusables[nextIndex].focus();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleNav = (id: string) => {
    setIsOpen(false);
    setHoveredIndex(null);
    document.body.style.overflow = '';

    if (id === 'studio' || id === 'portal' || id === 'account') {
      navigate(`/${id}`);
      return;
    }

    if (location.pathname !== '/') {
      navigate(`/#${id}`);
    } else {
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      document.getElementById(id)?.scrollIntoView({
        behavior: prefersReducedMotion ? 'auto' : 'smooth',
        block: id === 'hero' ? 'start' : 'center',
      });
    }
  };

  const isStudio = location.pathname === '/studio';
  const isPortal = location.pathname === '/portal';
  const isAccount = location.pathname === '/account';

  return (
    <nav aria-label="Main navigation">
      <div
        className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-300 ${isOpen
          ? 'bg-transparent border-b border-transparent'
          : 'bg-black/40 backdrop-blur-md border-b border-white/10'
          }`}
      >
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            {/* Logo - Left */}
            <div className="flex items-center">
              <a
                href="/#hero"
                onClick={(e) => {
                  e.preventDefault();
                  handleNav('hero');
                }}
                className="flex items-center cursor-pointer text-white"
              >
                <Logo />
              </a>
            </div>

            {/* Right side actions & unified menu trigger */}
            <div className="flex items-center space-x-6">
              <div className="hidden lg:flex items-center text-xs font-medium tracking-widest uppercase space-x-4">
                <button
                  type="button"
                  onClick={() => {
                    if (user) {
                      handleNav('portal');
                    } else {
                      setIsOpen(false);
                      setHoveredIndex(null);
                      onAuthClick();
                    }
                  }}
                  className={`px-6 py-3 rounded-full transition-all text-sm shadow-[0_0_15px_rgba(255,255,255,0.1)] hover:shadow-[0_0_25px_rgba(255,255,255,0.2)] hover:scale-105 ${isPortal || isStudio
                    ? 'bg-white text-black'
                    : 'bg-white/10 text-white hover:bg-white/20'
                    }`}
                >
                  Design Studio
                </button>
                {user ? (
                  <button
                    type="button"
                    onClick={() => handleNav('account')}
                    className={`flex items-center space-x-2 px-6 py-2.5 rounded-full transition-all font-semibold border border-transparent ${isAccount
                      ? 'bg-white text-black'
                      : 'text-white hover:bg-white/10 border-white/20'
                      }`}
                  >
                    <UserIcon className="w-4 h-4" aria-hidden="true" />
                    <span className="capitalize">{user.name || user.email.split('@')[0]}</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setIsOpen(false);
                      setHoveredIndex(null);
                      onAuthClick();
                    }}
                    className="px-6 py-2.5 border border-white/30 rounded-full hover:bg-white hover:text-black transition-all"
                  >
                    Sign In
                  </button>
                )}
              </div>

              <button
                ref={triggerRef}
                type="button"
                onClick={() => {
                  setIsOpen((prev) => !prev);
                  setHoveredIndex(null);
                }}
                aria-expanded={isOpen}
                aria-controls="site-navigation-menu"
                className="flex items-center space-x-2.5 text-white cursor-pointer focus:outline-none focus-visible:outline focus-visible:outline-1 focus-visible:outline-white/50 focus-visible:outline-offset-4"
              >
                <span className="text-xs font-medium tracking-widest uppercase">
                  {isOpen ? 'Close' : 'Menu'}
                </span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="55 25 103 110"
                  className="w-4 h-4 fill-current"
                  aria-hidden="true"
                >
                  <path d="M 110,30 A 50,50 0 0,0 110,130 Z" />
                  <path d="M 136.4,35 A 55,55 0 0,0 136.4,125 Z" />
                  <path d="M 152.7,45 A 50,50 0 0,0 152.7,115 Z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Full-Screen Opening Menu Overlay (always mounted in DOM for crawlers) */}
      <div
        ref={overlayRef}
        id="site-navigation-menu"
        aria-hidden={!isOpen}
        className={`fixed inset-0 z-40 bg-[#050505] overflow-y-auto flex flex-col justify-center transition-opacity duration-300 motion-reduce:transition-none ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
      >
        <div className="max-w-7xl w-full mx-auto px-6 md:px-12 pt-24 pb-12 my-auto">
          <div className="flex flex-col items-start">
            {NAV_ITEMS.map((item, index) => (
              <a
                key={item.id}
                href={`/#${item.id}`}
                tabIndex={isOpen ? 0 : -1}
                onClick={(e) => {
                  e.preventDefault();
                  handleNav(item.id);
                }}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                style={{ transitionDelay: isOpen ? `${index * 60}ms` : '0ms' }}
                className={`group flex items-baseline py-2 md:py-3 transition-all duration-300 ease-out motion-reduce:transition-none focus:outline-none focus-visible:outline focus-visible:outline-1 focus-visible:outline-white/50 focus-visible:outline-offset-4 ${isOpen
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 translate-y-4 motion-reduce:translate-y-0'
                  }`}
              >
                <span className="text-xs md:text-sm font-mono text-gray-500 mr-5 md:mr-8 select-none">
                  {item.num}
                </span>
                <span
                  className={`text-3xl sm:text-5xl md:text-6xl font-serif font-light tracking-tight transition-colors duration-200 ${hoveredIndex !== null && hoveredIndex !== index ? 'text-gray-500' : 'text-white'
                    }`}
                >
                  {item.label}
                </span>
              </a>
            ))}
          </div>

          <div className="lg:hidden border-t border-white/10 pt-6 mt-8 flex flex-wrap gap-4">
            <button
              type="button"
              tabIndex={isOpen ? 0 : -1}
              onClick={() => {
                if (user) {
                  handleNav('portal');
                } else {
                  setIsOpen(false);
                  setHoveredIndex(null);
                  onAuthClick();
                }
              }}
              className={`px-6 py-3 text-xs tracking-widest uppercase font-bold rounded-full ${isPortal || isStudio ? 'bg-white text-black' : 'bg-white/10 text-white'
                }`}
            >
              Design Studio
            </button>
            {user ? (
              <button
                type="button"
                tabIndex={isOpen ? 0 : -1}
                onClick={() => handleNav('account')}
                className={`px-6 py-3 text-xs tracking-widest uppercase font-medium capitalize border rounded-full ${isAccount
                  ? 'bg-white text-black border-transparent'
                  : 'border-white/20 text-white'
                  }`}
              >
                {user.name || user.email.split('@')[0]}
              </button>
            ) : (
              <button
                type="button"
                tabIndex={isOpen ? 0 : -1}
                onClick={() => {
                  setIsOpen(false);
                  setHoveredIndex(null);
                  onAuthClick();
                }}
                className="px-6 py-3 text-xs tracking-widest uppercase font-medium text-white border border-white/20 rounded-full"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
