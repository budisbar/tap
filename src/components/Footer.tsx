import { SmartphoneNfc } from 'lucide-react';

export default function Footer({ onHomeClick }: { onHomeClick?: () => void }) {
  const handleClick = () => {
    if (onHomeClick) {
      onHomeClick();
    } else {
      document.getElementById('hero')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="bg-[#050505] text-gray-500 py-12 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={handleClick}>
            <span className="text-xl font-bold tracking-tighter text-white font-sans">tap&amp;con</span>
          </div>
          <div className="flex space-x-8 text-[10px] uppercase tracking-widest font-bold mt-6 md:mt-0">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors">Support</a>
          </div>
        </div>
        <div className="mt-8 text-center text-[10px] uppercase tracking-widest border-t border-white/10 pt-8 opacity-60">
          <p>&copy; {new Date().getFullYear()} tap&con. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
