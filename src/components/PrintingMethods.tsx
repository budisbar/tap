import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const methods = [
  {
    id: 'plastic',
    num: '01',
    title: 'PREMIUM PLASTIC',
    description: 'Our premium plastic materials are designed for durability and a sleek finish. We offer distinct printing methods to match your brand\'s aesthetic:',
    options: [
      { name: 'Vinyl Printing', desc: 'High-quality vinyl wraps applied directly to the surface for vibrant, full-color designs.' },
      { name: 'Direct Printing', desc: 'UV-cured ink printed directly onto the plastic for a seamless, long-lasting matte finish.' }
    ],
    image: '/images/plastic_card.png'
  },
  {
    id: 'wood-bamboo',
    num: '02',
    title: 'BAMBOO & WOOD',
    description: 'Natural, elegant, and sustainable. Our wooden and bamboo products stand out with their unique grain patterns. We customize them using:',
    options: [
      { name: 'Laser Engraving', desc: 'Precise, deep burning of your logo into the wood for a premium, tactile feel.' },
      { name: 'Vinyl Printing', desc: 'Colorful overlays that contrast beautifully against the natural wood texture.' }
    ],
    image: '/images/wood_card.png'
  },
  {
    id: 'metal',
    num: '03',
    title: 'STAINLESS STEEL',
    description: 'The ultimate in luxury and durability. Our stainless steel products exude professionalism and class.',
    options: [
      { name: 'Laser Engraving', desc: 'Etches your design directly into the metal surface for a permanent, sleek silver/white finish.' },
      { name: 'Vinyl Printing', desc: 'Full-color designs carefully adhered to the metal for striking contrast.' }
    ],
    image: '/images/metal_card.png'
  }
];

export default function PrintingMethods() {
  const [activeId, setActiveId] = useState<string>('plastic');

  const activeMethod = methods.find(m => m.id === activeId) || methods[0];

  return (
    <section className="py-32 bg-[#050505] relative overflow-hidden border-t border-white/5">
      {/* Background decoration - optimized for performance (no css blurs) */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div 
          className="absolute top-0 right-1/4 w-96 h-96 rounded-full" 
          style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%)' }} 
        />
        <div 
          className="absolute bottom-0 left-1/4 w-[500px] h-[500px] rounded-full" 
          style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%)' }} 
        />
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        
        {/* Section Title */}
        <div className="mb-16 text-center">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif font-light text-white tracking-wide">
            Printing Methods
          </h2>
          <div className="w-24 h-px bg-white/20 mx-auto mt-8"></div>
        </div>

        {/* Navigation Tabs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 mb-20">
          {methods.map((method) => {
            const isActive = activeId === method.id;
            
            return (
              <button 
                key={method.id}
                onClick={() => setActiveId(method.id)} 
                className={`text-left flex flex-col group transition-all duration-300 focus:outline-none ${isActive ? 'opacity-100' : 'opacity-40 hover:opacity-70'}`}
              >
                <span className={`text-4xl lg:text-5xl font-light italic mb-3 transition-colors duration-300 ${isActive ? 'text-white' : 'text-gray-500'}`}>
                  {method.num}
                </span>
                <span className={`text-lg lg:text-xl font-bold tracking-widest transition-colors duration-300 ${isActive ? 'text-white' : 'text-gray-500'}`}>
                  {method.title}
                </span>
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="relative min-h-[500px]">
          <AnimatePresence mode="popLayout">
            <motion.div
              key={activeId}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15, ease: "easeInOut" }}
              className="max-w-4xl mx-auto"
            >
              {/* Text Info */}
              <div className="flex flex-col items-center">
                <p className="text-xl text-gray-300 leading-relaxed mb-12 text-center">
                  {activeMethod.description}
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 w-full">
                  {activeMethod.options.map((opt, idx) => (
                    <div key={idx} className="relative p-8 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                      <h4 className="text-xl font-semibold text-white mb-4 text-center">{opt.name}</h4>
                      <p className="text-gray-400 leading-relaxed text-center">{opt.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
