import { SmartphoneNfc, Menu, X, User as UserIcon } from 'lucide-react';
import { useState } from 'react';
import Logo from './Logo';
import { User } from '../lib/mockDb';

interface NavbarProps {
  currentPage: 'home' | 'studio' | 'portal';
  setCurrentPage: (page: 'home' | 'studio' | 'portal') => void;
  user: User | null;
  onAuthClick: () => void;
}

export default function Navbar({ currentPage, setCurrentPage, user, onAuthClick }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleNav = (id: string) => {
    if (id === 'studio') {
      setCurrentPage('studio');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (id === 'portal') {
      setCurrentPage('portal');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      if (currentPage !== 'home') {
        setCurrentPage('home');
        setTimeout(() => {
          document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      } else {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
      }
    }
    setIsOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/40 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3 cursor-pointer text-white" onClick={() => handleNav('hero')}>
            <Logo />
          </div>
          
          <div className="hidden md:flex items-center space-x-10 text-sm font-medium tracking-widest uppercase">
            <button onClick={() => handleNav('products')} className={`pb-1 border-b transition-all ${currentPage === 'home' ? 'text-gray-400 hover:text-white border-transparent hover:border-white' : 'text-gray-400 hover:text-white border-transparent hover:border-white'}`}>How it works</button>
            <button onClick={() => handleNav('studio')} className={`pb-1 border-b transition-all ${currentPage === 'studio' ? 'text-white border-white' : 'text-gray-400 hover:text-white border-transparent hover:border-white'}`}>Design Studio</button>
            
            {user ? (
              <button onClick={() => handleNav('portal')} className="flex items-center space-x-2 px-6 py-2 bg-white text-black rounded-full hover:bg-gray-200 transition-all font-semibold">
                <UserIcon className="w-4 h-4" />
                <span>Account</span>
              </button>
            ) : (
              <button onClick={onAuthClick} className="px-6 py-2 border border-white/30 rounded-full hover:bg-white hover:text-black transition-all">
                Sign In
              </button>
            )}
          </div>

          <div className="md:hidden flex items-center">
            <button onClick={() => setIsOpen(!isOpen)} className="text-white hover:text-gray-300">
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>
      
      {isOpen && (
        <div className="md:hidden bg-[#111] border-b border-white/10 px-4 pt-4 pb-6 space-y-4 shadow-2xl">
          <button onClick={() => handleNav('products')} className="block w-full text-left px-3 py-2 text-sm tracking-widest uppercase font-medium text-gray-400 hover:text-white">How it works</button>
          <button onClick={() => handleNav('studio')} className={`block w-full text-left px-3 py-2 text-sm tracking-widest uppercase font-medium ${currentPage === 'studio' ? 'text-white' : 'text-gray-400 hover:text-white'}`}>Design Studio</button>
          {user ? (
            <button onClick={() => handleNav('portal')} className={`block w-full text-left px-3 py-2 text-sm tracking-widest uppercase font-medium ${currentPage === 'portal' ? 'text-white' : 'text-gray-400 hover:text-white'}`}>Account</button>
          ) : (
            <button onClick={() => { setIsOpen(false); onAuthClick(); }} className="block w-full text-left px-3 py-2 text-sm tracking-widest uppercase font-medium text-white">Sign In</button>
          )}
        </div>
      )}
    </nav>
  );
}
