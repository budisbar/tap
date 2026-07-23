import { motion } from 'motion/react';
import { SmartphoneNfc } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import MagneticButton from './MagneticButton';

export default function Hero() {
  const navigate = useNavigate();

  const scrollToContact = () => {
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const handleDesignCard = () => {
    navigate('/studio');
  };

  return (
    <section id="hero" className="min-h-screen flex items-center justify-center overflow-hidden relative bg-[#050505] pt-20">
      {/* Background Glow */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] pointer-events-none select-none z-0"
        style={{
          background: 'radial-gradient(circle at center, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0) 60%)'
        }}
      />

      {/* Background Logo Watermark */}
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[85%] max-w-[650px] aspect-square pointer-events-none select-none z-0 text-white flex items-center justify-center"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="55 25 103 110" className="w-full h-full fill-current">
          {/* Left Semicircle - Slides in from left */}
          <motion.g
            style={{ willChange: 'transform, opacity' }}
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 0.55, x: 0 }}
            transition={{ duration: 1.2, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            <path d="M 110,30 A 50,50 0 0,0 110,130 Z" />
          </motion.g>

          {/* Middle Semicircle - Slides in from bottom */}
          <motion.g
            style={{ willChange: 'transform, opacity' }}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 0.55, y: 0 }}
            transition={{ duration: 1.2, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            <path d="M 136.4,35 A 55,55 0 0,0 136.4,125 Z" />
          </motion.g>

          {/* Right Semicircle - Slides in from right */}
          <motion.g
            style={{ willChange: 'transform, opacity' }}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 0.55, x: 0 }}
            transition={{ duration: 1.2, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <path d="M 152.7,45 A 50,50 0 0,0 152.7,115 Z" />
          </motion.g>
        </svg>
      </motion.div>

      <div className="max-w-4xl mx-auto px-6 relative z-10 flex flex-col items-center text-center w-full">

        {/* BIG TITLE */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-7xl md:text-9xl font-black text-white tracking-tighter mb-4 lowercase"
        >
          tap&amp;con
        </motion.h1>

        {/* HEADLINE */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-2xl md:text-4xl text-gray-300 font-light leading-relaxed mb-8 max-w-2xl"
        >
          Master <span className="italic font-normal">Optimization</span> with One Tap.
        </motion.p>

        {/* BUTTONS */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-col sm:flex-row items-center justify-center space-y-6 sm:space-y-0 sm:space-x-6"
        >
          <MagneticButton onClick={scrollToContact}>
            <button
              className="px-6 py-3 bg-white text-black font-semibold rounded-sm hover:bg-gray-200 transition-all cursor-pointer text-center text-base"
            >
              Contact Us
            </button>
          </MagneticButton>
          <MagneticButton onClick={handleDesignCard}>
            <button
              className="w-44 h-28 bg-white text-black rounded-lg p-3 flex flex-col justify-between shadow-[0_10px_20px_rgba(0,0,0,0.2)] hover:bg-gray-100 hover:scale-105 transition-all cursor-pointer select-none text-left relative overflow-hidden group border border-black/10"
            >
              <div className="flex justify-end w-full">
                <SmartphoneNfc className="w-4 h-4 text-black/50" />
              </div>
              
              <div className="my-auto">
                <span className="text-base font-bold tracking-tight block leading-tight">Design your card</span>
              </div>
              
              <div className="text-[8px] font-mono tracking-widest text-black/50 uppercase">
                tap&amp;con
              </div>
            </button>
          </MagneticButton>
        </motion.div>



      </div>
    </section>
  );
}
