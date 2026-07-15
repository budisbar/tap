import { motion } from 'motion/react';
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

        {/* ANIMATION */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="relative w-full h-[500px] flex items-center justify-center mt-8 hidden md:flex"
        >
          {/* Background glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-white/5 to-transparent rounded-full blur-3xl mix-blend-screen pointer-events-none"></div>

          <div className="relative w-full h-full flex items-center justify-center transform scale-110">
            {/* The NFC Card */}
            <motion.div
              animate={{
                scale: [1, 1, 0.95, 1, 1],
                rotateY: [0, 0, 10, 0, 0]
              }}
              transition={{ duration: 6, repeat: Infinity, times: [0, 0.2, 0.3, 0.4, 1], ease: "easeInOut" }}
              className="absolute z-10 w-48 h-72 rounded-2xl bg-[#0a0a0a] border border-white/10 shadow-2xl overflow-hidden flex flex-col p-6 transform -rotate-12"
            >
              <div className="w-full flex justify-end">
                <Wifi className="w-6 h-6 text-white/20 transform rotate-90" />
              </div>
              <div className="w-full flex items-center justify-center flex-1">
                <span className="text-white/60 text-2xl font-black tracking-tighter lowercase">tap&amp;con</span>
              </div>
            </motion.div>

            {/* Ripple Effect on Tap */}
            <motion.div
              animate={{
                scale: [0.5, 0.5, 1.5, 2, 2],
                opacity: [0, 0, 0.8, 0, 0]
              }}
              transition={{ duration: 6, repeat: Infinity, times: [0, 0.2, 0.25, 0.4, 1], ease: "easeOut" }}
              className="absolute z-15 w-32 h-32 border border-white/50 bg-white/10 rounded-full pointer-events-none"
              style={{ marginLeft: '40px', marginTop: '60px' }}
            ></motion.div>

            {/* The Phone */}
            <motion.div
              animate={{
                x: [350, 40, 40, 40, 350],
                y: [300, 60, 60, 60, 300],
                rotate: [20, -5, -5, -5, 20]
              }}
              transition={{ duration: 6, repeat: Infinity, times: [0, 0.2, 0.5, 0.8, 1], ease: "easeInOut" }}
              className="absolute z-20 w-56 h-[400px] bg-black border-[6px] border-gray-800 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col items-center"
            >
              {/* Dynamic Island / Notch */}
              <div className="w-16 h-4 bg-black rounded-full absolute top-2 z-30"></div>

              {/* Phone Screen: Home / Blank */}
              <motion.div
                animate={{ opacity: [1, 1, 0, 0, 1] }}
                transition={{ duration: 6, repeat: Infinity, times: [0, 0.25, 0.3, 0.75, 0.8] }}
                className="absolute inset-0 bg-gradient-to-b from-gray-900 to-[#0a0a0a] w-full h-full flex flex-col items-center justify-center p-4"
              >
                <SmartphoneNfc className="w-8 h-8 text-white/20 mb-4" />
                <div className="text-white/40 text-xs text-center">Ready to scan</div>
              </motion.div>

              {/* Phone Screen: Google Reviews UI */}
              <motion.div
                animate={{ opacity: [0, 0, 1, 1, 0] }}
                transition={{ duration: 6, repeat: Infinity, times: [0, 0.25, 0.3, 0.75, 0.8] }}
                className="absolute inset-0 bg-white w-full h-full p-4 pt-10 flex flex-col"
              >
                <div className="flex items-center space-x-2 mb-4">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">G</div>
                  <div>
                    <div className="text-xs font-bold text-gray-800">The Artisan Cafe</div>
                    <div className="text-[10px] text-gray-500">Rate and review</div>
                  </div>
                </div>

                <div className="flex justify-center space-x-1 my-4">
                  {[...Array(5)].map((_, i) => (
                    <motion.div
                      key={i}
                      animate={{ scale: [1, 1.3, 1] }}
                      transition={{ duration: 0.3, delay: 1.5 + (i * 0.1), repeat: Infinity, repeatDelay: 5.7 }}
                    >
                      <Star className="w-6 h-6 fill-yellow-400 text-yellow-400" />
                    </motion.div>
                  ))}
                </div>

                <div className="bg-gray-100 rounded-xl p-3 flex-1 flex flex-col space-y-2">
                  <div className="h-2 w-1/2 bg-gray-300 rounded"></div>
                  <div className="h-2 w-full bg-gray-200 rounded"></div>
                  <div className="h-2 w-3/4 bg-gray-200 rounded"></div>
                </div>

                <div className="mt-4 bg-blue-600 text-white rounded-lg py-2 text-center text-xs font-bold shadow-md">Post Review</div>
              </motion.div>

            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
