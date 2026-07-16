import { motion, useScroll, useTransform } from 'motion/react';
import { SmartphoneNfc, Star, Wifi } from 'lucide-react';

interface HeroProps {
  onDesignCard?: () => void;
}

export default function Hero({ onDesignCard }: HeroProps) {
  const scrollToContact = () => {
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="hero" className="pt-32 pb-24 md:pt-40 md:pb-32 overflow-hidden relative bg-transparent">
      <div className="max-w-4xl mx-auto px-6 relative z-10 flex flex-col items-center text-center">

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
          className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 mb-20"
        >
          <button
            onClick={scrollToContact}
            className="px-8 py-4 bg-white text-black font-semibold rounded-sm hover:bg-gray-200 transition-all cursor-pointer text-center text-lg"
          >
            Contact Us
          </button>
          <button
            onClick={onDesignCard}
            className="px-8 py-4 border border-white/20 text-white font-semibold rounded-sm hover:bg-white/5 transition-all cursor-pointer text-center text-lg"
          >
            Design your card
          </button>
        </motion.div>



      </div>
    </section>
  );
}
