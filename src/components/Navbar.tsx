import { SmartphoneNfc, Menu, X, User as UserIcon } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Logo from './Logo';
import { User } from '../lib/mockDb';

interface NavbarProps {
  user: User | null;
  onAuthClick: () => void;
}

export default function Navbar({ user, onAuthClick }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');
  const navigate = useNavigate();
  const location = useLocation();

  // Scroll spy for active section
  useEffect(() => {
    if (location.pathname !== '/') return;

    const sections = ['hero', 'products', 'why-reviews', 'eco-friendly', 'custom-quote', 'faq', 'contact'];
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    }, { rootMargin: '-20% 0px -80% 0px' });

    sections.forEach(id => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [location.pathname]);

  const handleNav = (id: string) => {
    setIsOpen(false);
    
    if (id === 'studio' || id === 'portal') {
      navigate(`/${id}`);
      return;
    }

    if (location.pathname !== '/') {
      navigate(`/#${id}`);
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const isHome = location.pathname === '/';
  const isStudio = location.pathname === '/studio';
  const isPortal = location.pathname === '/portal';

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/40 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          {/* Logo - Left */}
          <div className="flex items-center flex-1 cursor-pointer text-white" onClick={() => handleNav('hero')}>
            <Logo />
          </div>
          
          {/* Links - Center */}
          <div className="hidden lg:flex items-center justify-center space-x-8 text-xs font-medium tracking-widest uppercase">
            <button onClick={() => handleNav('products')} className={`pb-1 border-b transition-all ${isHome && activeSection === 'products' ? 'text-white border-white' : 'text-gray-400 hover:text-white border-transparent hover:border-white'}`}>How it works</button>
            <button onClick={() => handleNav('why-reviews')} className={`pb-1 border-b transition-all ${isHome && activeSection === 'why-reviews' ? 'text-white border-white' : 'text-gray-400 hover:text-white border-transparent hover:border-white'}`}>Optimization</button>
            <button onClick={() => handleNav('eco-friendly')} className={`pb-1 border-b transition-all ${isHome && activeSection === 'eco-friendly' ? 'text-white border-white' : 'text-gray-400 hover:text-white border-transparent hover:border-white'}`}>Eco</button>
            <button onClick={() => handleNav('custom-quote')} className={`pb-1 border-b transition-all ${isHome && activeSection === 'custom-quote' ? 'text-white border-white' : 'text-gray-400 hover:text-white border-transparent hover:border-white'}`}>Quote</button>
            <button onClick={() => handleNav('faq')} className={`pb-1 border-b transition-all ${isHome && activeSection === 'faq' ? 'text-white border-white' : 'text-gray-400 hover:text-white border-transparent hover:border-white'}`}>FAQ</button>
            <button onClick={() => handleNav('contact')} className={`pb-1 border-b transition-all ${isHome && activeSection === 'contact' ? 'text-white border-white' : 'text-gray-400 hover:text-white border-transparent hover:border-white'}`}>Contact</button>
          </div>
          
          {/* Auth Button & Studio - Right */}
          <div className="hidden lg:flex items-center justify-end flex-1 text-xs font-medium tracking-widest uppercase space-x-4">
            <button onClick={() => handleNav('studio')} className={`px-6 py-3 rounded-full transition-all text-sm shadow-[0_0_15px_rgba(255,255,255,0.1)] hover:shadow-[0_0_25px_rgba(255,255,255,0.2)] hover:scale-105 ${isStudio ? 'bg-white text-black' : 'bg-white/10 text-white hover:bg-white/20'}`}>
              Design Studio
            </button>
            {user ? (
              <button onClick={() => handleNav('portal')} className="flex items-center space-x-2 px-6 py-2.5 bg-white text-black rounded-full hover:bg-gray-200 transition-all font-semibold">
                <UserIcon className="w-4 h-4" />
                <span className="capitalize">{user.name || user.email.split('@')[0]}</span>
              </button>
            ) : (
              <button onClick={onAuthClick} className="px-6 py-2.5 border border-white/30 rounded-full hover:bg-white hover:text-black transition-all">
                Sign In
              </button>
            )}
          </div>

          <div className="lg:hidden flex items-center justify-end flex-1">
            <button onClick={() => setIsOpen(!isOpen)} className="text-white hover:text-gray-300">
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>
      
      {isOpen && (
        <div className="lg:hidden bg-[#0a0a0a] border-b border-white/10 px-4 pt-4 pb-6 space-y-4 shadow-2xl absolute w-full left-0 top-[72px] h-screen overflow-y-auto pb-32">
          <button onClick={() => handleNav('products')} className={`block w-full text-left px-3 py-2 text-sm tracking-widest uppercase font-medium ${isHome && activeSection === 'products' ? 'text-white' : 'text-gray-400 hover:text-white'}`}>How it works</button>
          <button onClick={() => handleNav('why-reviews')} className={`block w-full text-left px-3 py-2 text-sm tracking-widest uppercase font-medium ${isHome && activeSection === 'why-reviews' ? 'text-white' : 'text-gray-400 hover:text-white'}`}>Optimization</button>
          <button onClick={() => handleNav('eco-friendly')} className={`block w-full text-left px-3 py-2 text-sm tracking-widest uppercase font-medium ${isHome && activeSection === 'eco-friendly' ? 'text-white' : 'text-gray-400 hover:text-white'}`}>Eco-Friendly</button>
          <button onClick={() => handleNav('custom-quote')} className={`block w-full text-left px-3 py-2 text-sm tracking-widest uppercase font-medium ${isHome && activeSection === 'custom-quote' ? 'text-white' : 'text-gray-400 hover:text-white'}`}>Custom Quote</button>
          <button onClick={() => handleNav('faq')} className={`block w-full text-left px-3 py-2 text-sm tracking-widest uppercase font-medium ${isHome && activeSection === 'faq' ? 'text-white' : 'text-gray-400 hover:text-white'}`}>FAQ</button>
          <button onClick={() => handleNav('contact')} className={`block w-full text-left px-3 py-2 text-sm tracking-widest uppercase font-medium ${isHome && activeSection === 'contact' ? 'text-white' : 'text-gray-400 hover:text-white'}`}>Contact</button>
          
          <div className="border-t border-white/10 pt-4 mt-4 space-y-4">
            <button onClick={() => handleNav('studio')} className={`block w-full text-center px-4 py-3 text-sm tracking-widest uppercase font-bold rounded-xl ${isStudio ? 'bg-white text-black' : 'bg-white/10 text-white'}`}>Design Studio</button>
            {user ? (
              <button onClick={() => handleNav('portal')} className={`block w-full text-center px-4 py-3 text-sm tracking-widest uppercase font-medium capitalize border border-white/20 rounded-xl ${isPortal ? 'text-white' : 'text-gray-400 hover:text-white'}`}>{user.name || user.email.split('@')[0]}</button>
            ) : (
              <button onClick={() => { setIsOpen(false); onAuthClick(); }} className="block w-full text-center px-4 py-3 text-sm tracking-widest uppercase font-medium text-white border border-white/20 rounded-xl">Sign In</button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
