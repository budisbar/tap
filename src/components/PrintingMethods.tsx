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
    image: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&q=80&w=1000'
  },
  {
    id: 'wood',
    num: '02',
    title: 'WOOD',
    description: 'Natural, elegant, and timeless. Our wooden products stand out with their unique grain patterns. We customize them using:',
    options: [
      { name: 'Laser Engraving', desc: 'Precise, deep burning of your logo into the wood for a premium, tactile feel.' },
      { name: 'Vinyl Printing', desc: 'Colorful overlays that contrast beautifully against the natural wood texture.' }
    ],
    image: '/images/wood-printing.jpg'
  },
  {
    id: 'bamboo',
    num: '03',
    title: 'BAMBOO',
    description: 'Eco-friendly and sustainable, bamboo offers a smooth, lightweight finish. Customization methods include:',
    options: [
      { name: 'Laser Engraving', desc: 'Creates a beautiful, contrasting burn mark that highlights the bamboo\'s natural fibers.' },
      { name: 'Vinyl Printing', desc: 'Vibrant colors applied with precision to complement the light bamboo surface.' }
    ],
    image: 'https://images.unsplash.com/photo-1516049247604-09dc99cddb6e?auto=format&fit=crop&q=80&w=1000'
  },
  {
    id: 'metal',
    num: '04',
    title: 'STAINLESS STEEL',
    description: 'The ultimate in luxury and durability. Our stainless steel products exude professionalism and class.',
    options: [
      { name: 'Laser Engraving', desc: 'Etches your design directly into the metal surface for a permanent, sleek silver/white finish.' },
      { name: 'Vinyl Printing', desc: 'Full-color designs carefully adhered to the metal for striking contrast.' }
    ],
    image: '/images/metal-printing.jpg'
  }
];

export default function PrintingMethods() {
  const [activeId, setActiveId] = useState<string>('plastic');

  const activeMethod = methods.find(m => m.id === activeId) || methods[0];

  return (
    <section className="py-32 bg-[#050505] relative overflow-hidden border-t border-white/5">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-white/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-white/5 rounded-full blur-[150px]" />
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        {/* Navigation Tabs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 mb-20">
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
          <AnimatePresence mode="wait">
            <motion.div
              key={activeId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24 items-center"
            >
              {/* Text Info */}
              <div className="lg:col-span-5 order-2 lg:order-1">
                <p className="text-xl text-gray-300 leading-relaxed mb-10">
                  {activeMethod.description}
                </p>
                
                <div className="space-y-8">
                  {activeMethod.options.map((opt, idx) => (
                    <div key={idx} className="relative pl-6 border-l-2 border-white/20">
                      <h4 className="text-xl font-semibold text-white mb-2">{opt.name}</h4>
                      <p className="text-gray-400 leading-relaxed">{opt.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Image */}
              <div className="lg:col-span-7 order-1 lg:order-2">
                <div className="relative w-full aspect-[4/3] lg:aspect-auto lg:h-[600px] rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
                  {/* Subtle inner shadow/gradient for glassmorphism */}
                  <div className="absolute inset-0 ring-1 ring-inset ring-white/10 rounded-3xl pointer-events-none z-10" />
                  <div className="absolute inset-0 bg-gradient-to-tr from-black/40 via-transparent to-white/10 z-10 pointer-events-none" />
                  
                  <img 
                    src={activeMethod.image} 
                    alt={`${activeMethod.title} printing methods`}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 hover:scale-105"
                  />
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
