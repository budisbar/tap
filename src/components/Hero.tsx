import { motion } from 'motion/react';
import { ArrowRight, SmartphoneNfc, Star, Wifi, Coffee } from 'lucide-react';

export default function Hero() {
  const scrollToContact = () => {
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="hero" className="pt-40 pb-24 md:pt-48 md:pb-32 overflow-hidden relative bg-transparent">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10 flex flex-col md:flex-row items-center">
        <div className="w-full md:w-1/2 flex flex-col justify-center pr-0 md:pr-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-4"
          >
            <span className="text-xs font-bold text-gray-500 uppercase tracking-[0.4em]">The Future of Service Reviewing</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl md:text-7xl font-light text-white leading-tight mb-8 font-serif"
          >
            Master Review <span className="italic font-normal">Optimization</span><br /> with One Tap.
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg text-gray-400 font-light leading-relaxed mb-12 max-w-md"
          >
            Empower your business with custom NFC hardware. Make it effortless for customers to review your service instantly, boosting engagement and landing future clients.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4"
          >
            <button 
              onClick={scrollToContact}
              className="px-8 py-4 bg-white text-black font-semibold rounded-sm hover:bg-gray-200 transition-all cursor-pointer text-center"
            >
              Book a Strategy Meeting
            </button>
            <button 
              onClick={() => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-8 py-4 border border-white/20 text-white font-semibold rounded-sm hover:bg-white/5 transition-all cursor-pointer text-center"
            >
              View Products
            </button>
          </motion.div>
        </div>
        
        <div className="w-full md:w-1/2 mt-16 md:mt-0 relative hidden md:block h-[500px]">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-br from-white/5 to-transparent rounded-full blur-3xl mix-blend-screen pointer-events-none"></div>
          
          <div className="relative w-full h-full flex items-center justify-center">
            {/* Card 1: Google Reviews (Black/Premium) */}
            <motion.div 
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="absolute z-30 w-64 h-40 rounded-xl bg-gradient-to-tr from-gray-900 to-black border border-white/20 shadow-2xl p-5 flex flex-col justify-between transform -rotate-6 translate-x-[-40px] translate-y-[-40px] hover:scale-105 transition-transform cursor-pointer"
            >
              <div className="flex justify-between items-start">
                <div className="text-white font-bold tracking-wider">Review Us</div>
                <SmartphoneNfc className="text-white/50 w-5 h-5" />
              </div>
              <div className="flex justify-center space-x-1 my-2">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <div className="text-[10px] text-gray-400 uppercase tracking-widest text-center mt-2">Tap to leave a Google Review</div>
            </motion.div>

            {/* Card 2: Custom Brand / Cafe (White/Glass) */}
            <motion.div 
              animate={{ y: [0, 10, 0] }}
              transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 1 }}
              className="absolute z-20 w-64 h-40 rounded-xl bg-gradient-to-bl from-white/90 to-white/70 border border-white shadow-xl p-5 flex flex-col justify-between transform rotate-12 translate-x-[60px] translate-y-[20px] hover:scale-105 transition-transform cursor-pointer"
            >
              <div className="flex justify-between items-start">
                <Coffee className="text-black w-6 h-6" />
                <Wifi className="text-black/50 w-5 h-5" />
              </div>
              <div className="text-center">
                <h3 className="text-black font-serif italic text-xl font-bold">The Artisan</h3>
                <p className="text-black/60 text-xs">Coffee & Roastery</p>
              </div>
              <div className="text-[10px] text-black/60 uppercase tracking-widest text-center mt-2 font-semibold">Tap for Menu & Wi-Fi</div>
            </motion.div>

            {/* Card 3: VIP Access (Gold/Metallic) */}
            <motion.div 
              animate={{ y: [0, -8, 0] }}
              transition={{ repeat: Infinity, duration: 6, ease: "easeInOut", delay: 2 }}
              className="absolute z-10 w-64 h-40 rounded-xl bg-gradient-to-r from-amber-700 via-amber-500 to-amber-700 border border-amber-300/50 shadow-2xl p-5 flex flex-col justify-between transform -rotate-12 translate-x-[-20px] translate-y-[80px] hover:scale-105 transition-transform cursor-pointer"
            >
              <div className="flex justify-end">
                <SmartphoneNfc className="text-amber-900/50 w-5 h-5" />
              </div>
              <div className="text-center">
                <h3 className="text-white font-serif tracking-widest text-xl font-bold uppercase drop-shadow-md">VIP Member</h3>
              </div>
              <div className="flex justify-between items-end">
                <div className="text-amber-100/70 text-[10px] font-mono">0001</div>
                <div className="text-[10px] text-amber-900 uppercase tracking-widest font-bold">Tap to Access</div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
