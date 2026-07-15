import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';

const steps = [
  {
    id: 'step1',
    title: 'Design your card',
    description: 'Use our customizer to brand your card with your logo, fonts, and colors.',
  },
  {
    id: 'step2',
    title: 'Receive it programmed',
    description: 'We encode your card with your desired link and ship it ready to use.',
  },
  {
    id: 'step3',
    title: 'Tap to connect',
    description: 'No app required. Customers simply tap their phone to instantly open your page.',
  }
];

export default function Products() {
  return (
    <section id="products" className="py-24 relative bg-transparent border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-4xl md:text-5xl font-serif font-light text-white mb-6">How it Works</h2>
          <p className="text-lg text-gray-400 font-light">
            A simple three-step visual guide to getting started with your custom NFC cards.
          </p>
        </div>

        <div className="relative mb-20">
          {/* Subtle connecting background line for desktop */}
          <div className="hidden md:block absolute top-1/2 left-[10%] right-[10%] h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-y-1/2 z-0"></div>

          <div className="grid md:grid-cols-3 gap-8 md:gap-12 relative z-10">
            {steps.map((step, index) => {
              return (
                <div key={step.id} className="relative">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: index * 0.2 }}
                    className="h-64 bg-[#111] border border-white/10 rounded-2xl p-8 flex flex-col justify-between shadow-[0_0_30px_rgba(0,0,0,0.8)] hover:bg-[#151515] hover:border-white/20 transition-all hover:-translate-y-2 group"
                  >
                    <div className="flex justify-between items-start">
                      <div className="w-10 h-10 rounded-full bg-white/5 border border-white/20 flex items-center justify-center text-[12px] text-white font-mono group-hover:bg-white/10 transition-colors">0{index + 1}</div>
                      <div className="text-white/40 font-bold tracking-widest text-[10px] uppercase font-sans">Step {index + 1}</div>
                    </div>
                    <div>
                      <h3 className="text-2xl font-light text-white mb-3 italic font-serif">{step.title}</h3>
                      <p className="text-sm text-gray-400 leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </motion.div>

                  {/* Arrow pointing to next step */}
                  {index < steps.length - 1 && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: (index * 0.2) + 0.3 }}
                      className="hidden md:flex absolute top-1/2 -right-8 w-8 h-8 -translate-y-1/2 z-20 items-center justify-center text-white/30"
                    >
                      <ArrowRight className="w-6 h-6 animate-pulse" />
                    </motion.div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="max-w-3xl mx-auto text-center border-t border-white/10 pt-10">
          <p className="text-sm text-gray-500 leading-relaxed">
            <strong className="text-gray-300">Privacy First:</strong> Our NFC cards do not extract personal data from users' phones. They simply broadcast a secure link, ensuring a safe and frictionless experience for everyone.
          </p>
        </div>
      </div>
    </section>
  );
}
