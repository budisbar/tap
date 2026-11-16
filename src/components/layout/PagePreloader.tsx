import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

export function NfcPulseLogo({ className = 'w-[88px] h-[88px]' }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="51.5 25 110 110"
      className={className}
      style={{ filter: 'drop-shadow(0 0 12px rgba(255, 255, 255, 0.25))' }}
      aria-label="tap&con loading"
    >
      <motion.path
        d="M 110,30 A 50,50 0 0,0 110,130 Z"
        fill="#ffffff"
        style={{ transformOrigin: 'center' }}
        animate={{ opacity: [0.25, 1, 0.25], scale: [0.96, 1.03, 0.96] }}
        transition={{ duration: 1.1, repeat: Infinity, ease: 'easeInOut', delay: 0 }}
      />
      <motion.path
        d="M 136.4,35 A 55,55 0 0,0 136.4,125 Z"
        fill="#ffffff"
        style={{ transformOrigin: 'center' }}
        animate={{ opacity: [0.25, 1, 0.25], scale: [0.96, 1.03, 0.96] }}
        transition={{ duration: 1.1, repeat: Infinity, ease: 'easeInOut', delay: 0.15 }}
      />
      <motion.path
        d="M 152.7,45 A 50,50 0 0,0 152.7,115 Z"
        fill="#ffffff"
        style={{ transformOrigin: 'center' }}
        animate={{ opacity: [0.25, 1, 0.25], scale: [0.96, 1.03, 0.96] }}
        transition={{ duration: 1.1, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
      />
    </svg>
  );
}

export default function PagePreloader() {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 950);

    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="page-preloader"
          initial={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-[200] flex items-center justify-center bg-[#050505] pointer-events-none"
        >
          <NfcPulseLogo />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
