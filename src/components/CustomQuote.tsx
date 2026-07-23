import { motion } from 'motion/react';
import MagneticButton from './MagneticButton';

export default function CustomQuote() {
  return (
    <section id="custom-quote" className="py-24 bg-[#050505] text-white">
      <div className="max-w-5xl mx-auto px-4 md:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="bg-white/5 border border-white/10 rounded-3xl p-10 md:p-16 shadow-2xl overflow-hidden relative"
        >
          <div className="relative z-10">
            <h2 className="text-3xl md:text-5xl font-bold mb-6 tracking-tight text-white">Get a Custom Quote</h2>
            <p className="text-lg text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
              Need a tailored solution for your business? We offer custom NFC card designs, bulk ordering, and specialized integrations. Get in touch with us to discuss your specific requirements.
            </p>
            <MagneticButton 
              onClick={() => {
                document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }}
            >
              <button
                className="inline-flex items-center gap-2 px-6 py-3 bg-white hover:bg-gray-200 text-black rounded-sm font-semibold transition-colors duration-200"
              >
                Custom Quote
              </button>
            </MagneticButton>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
