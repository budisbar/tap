import { motion } from 'motion/react';
import { Calendar, MessageSquare, Building2, User, Mail } from 'lucide-react';

export default function Contact() {
  return (
    <section id="contact" className="py-24 bg-white text-black">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-4xl md:text-5xl font-bold uppercase tracking-tighter mb-6 font-sans">
                Scale Your Business.
              </h2>
              <p className="text-lg opacity-60 mb-10 leading-relaxed max-w-md">
                Book a free consultation with our team. We'll show you how our NFC solutions can be customized for your brand to drive more reviews and delight customers.
              </p>
              
              <div className="space-y-8">
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-12 h-12 rounded-full border border-black/20 flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-black" />
                    </div>
                  </div>
                  <div className="ml-5">
                    <h4 className="text-xl font-light text-black mb-1">Pick a time</h4>
                    <p className="text-sm opacity-60">Choose a slot that works perfectly for your schedule.</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-12 h-12 rounded-full border border-black/20 flex items-center justify-center">
                      <MessageSquare className="w-5 h-5 text-black" />
                    </div>
                  </div>
                  <div className="ml-5">
                    <h4 className="text-xl font-light text-black mb-1">Discuss your needs</h4>
                    <p className="text-sm opacity-60">We'll tailor the NFC card designs to perfectly match your brand.</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="border-l md:border-black/10 md:pl-16 flex flex-col justify-center"
          >
            <h3 className="text-[10px] uppercase tracking-widest font-bold mb-8">Book a Meeting</h3>
            <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>
              <div>
                <label htmlFor="name" className="block text-[10px] uppercase tracking-widest font-bold mb-1">Full Name</label>
                <div className="relative">
                  <input type="text" id="name" className="block w-full border-b border-black/20 pb-2 text-xl font-light focus:outline-none focus:border-black bg-transparent transition-colors" placeholder="John Doe" />
                </div>
              </div>
              
              <div>
                <label htmlFor="email" className="block text-[10px] uppercase tracking-widest font-bold mb-1">Work Email</label>
                <div className="relative">
                  <input type="email" id="email" className="block w-full border-b border-black/20 pb-2 text-xl font-light focus:outline-none focus:border-black bg-transparent transition-colors" placeholder="john@company.com" />
                </div>
              </div>

              <div>
                <label htmlFor="company" className="block text-[10px] uppercase tracking-widest font-bold mb-1">Business Name</label>
                <div className="relative">
                  <input type="text" id="company" className="block w-full border-b border-black/20 pb-2 text-xl font-light focus:outline-none focus:border-black bg-transparent transition-colors" placeholder="The Local Cafe" />
                </div>
              </div>

              <button type="submit" className="w-full bg-black text-white px-10 py-5 font-bold uppercase tracking-widest hover:invert transition-all mt-8">
                Book Strategy Meeting
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
