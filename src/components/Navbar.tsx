import { SmartphoneNfc, Menu, X } from 'lucide-react';
import { useState } from 'react';

interface NavbarProps {
  currentPage: 'home' | 'studio';
  setCurrentPage: (page: 'home' | 'studio') => void;
}

export default function Navbar({ currentPage, setCurrentPage }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleNav = (id: string) => {
    if (id === 'studio') {
      setCurrentPage('studio');
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
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => handleNav('hero')}>
            <div className="w-10 h-10 bg-gradient-to-br from-gray-400 to-gray-800 rounded-lg flex items-center justify-center border border-white/20">
              <div className="w-4 h-4 rounded-full border-2 border-white/80"></div>
            </div>
            <span className="text-2xl font-bold tracking-tighter text-white uppercase font-sans">TapConnect</span>
          </div>
          
          <div className="hidden md:flex items-center space-x-10 text-sm font-medium tracking-widest uppercase">
            <button onClick={() => handleNav('products')} className="text-gray-400 hover:text-white border-b border-transparent hover:border-white transition-all pb-1">Products</button>
            <button onClick={() => handleNav('studio')} className={`pb-1 border-b transition-all ${currentPage === 'studio' ? 'text-white border-white' : 'text-gray-400 hover:text-white border-transparent hover:border-white'}`}>Design Studio</button>
            <button onClick={() => handleNav('contact')} className="px-6 py-2 border border-white/30 rounded-full hover:bg-white hover:text-black transition-all">
              Book Meeting
            </button>
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
          <button onClick={() => handleNav('products')} className="block w-full text-left px-3 py-2 text-sm tracking-widest uppercase font-medium text-gray-400 hover:text-white">Products</button>
          <button onClick={() => handleNav('studio')} className={`block w-full text-left px-3 py-2 text-sm tracking-widest uppercase font-medium ${currentPage === 'studio' ? 'text-white' : 'text-gray-400 hover:text-white'}`}>Design Studio</button>
          <button onClick={() => handleNav('contact')} className="block w-full text-left px-3 py-2 text-sm tracking-widest uppercase font-medium text-white">Book Meeting</button>
        </div>
      )}
    </nav>
  );
}
