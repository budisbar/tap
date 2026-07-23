import { motion } from 'motion/react';
import { Leaf, ExternalLink } from 'lucide-react';

export default function EcoFriendly() {
  return (
    <section id="eco-friendly" className="py-16 bg-[#050505] text-white overflow-hidden relative border-t border-white/5">
      {/* Eco Glow */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] pointer-events-none -z-10 transform-gpu" 
        style={{
          background: 'radial-gradient(ellipse at center, rgba(34, 197, 94, 0.08) 0%, rgba(34, 197, 94, 0) 70%)'
        }}
      />
      
      <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center text-center"
        >
          <a 
            href="https://www.forbes.com/sites/theyec/2018/08/20/why-sustainable-branding-matters/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20 hover:bg-green-500/20 transition-all cursor-pointer mb-6 group"
          >
            <Leaf className="w-5 h-5 text-green-400 group-hover:scale-110 transition-transform" />
            <span className="text-sm font-medium text-green-400 group-hover:text-green-300">Why Sustainable Branding Matters</span>
            <ExternalLink className="w-4 h-4 text-green-400/50 group-hover:text-green-400 transition-colors" />
          </a>
          
          <h2 className="text-4xl md:text-5xl font-serif font-light mb-6 leading-tight max-w-2xl">
            One Card. <span className="italic font-normal text-green-400">Zero Waste.</span>
          </h2>
          
          <p className="text-lg text-gray-400 mb-10 leading-relaxed max-w-3xl">
            Position your brand as a sustainability leader. By switching to Tap & Con, you're not just upgrading your networking—you're eliminating the need to ever print a paper business card again. Save thousands of trees and hit your ESG goals effortlessly.
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-2 gap-12 md:gap-24 border-t border-white/10 pt-8 w-full max-w-2xl">
            <div>
              <h4 className="text-3xl font-bold text-white mb-2">10B+</h4>
              <p className="text-sm text-gray-500 uppercase tracking-widest font-bold">Business Cards Printed Yearly</p>
            </div>
            <div>
              <h4 className="text-3xl font-bold text-green-400 mb-2">88%</h4>
              <p className="text-sm text-gray-500 uppercase tracking-widest font-bold">Are Thrown Away In a Week</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
