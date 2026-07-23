import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown } from 'lucide-react';

const faqs = [
  {
    question: "How does the NFC card work?",
    answer: "Simply tap your card on any NFC-enabled smartphone to instantly share your contact details, social media links, or custom landing page. No app is required for the receiver."
  },
  {
    question: "Can I customize the design of my card?",
    answer: "Yes! We offer a full design studio where you can upload your logo, choose colors, and add text to create a completely unique card that matches your brand."
  },
  {
    question: "Do I need to pay a monthly subscription?",
    answer: "No, there are no monthly fees. You pay a one-time fee for the card, and your digital profile is hosted for free."
  },
  {
    question: "Do I need to download an app?",
    answer: "No app is required for you or the person receiving your information. The card uses built-in NFC technology that works instantly with both iOS and Android devices."
  },
  {
    question: "Do you offer bulk discounts for teams?",
    answer: "Yes, we have special pricing for corporate teams and bulk orders. Contact us or request a custom quote for more information."
  }
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="py-24 bg-[#050505] text-white">
      <div className="max-w-3xl mx-auto px-4 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">Frequently Asked Questions</h2>
          <p className="text-gray-400 text-lg">Got questions? We've got answers.</p>
        </motion.div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="border border-white/10 rounded-2xl overflow-hidden bg-white/5 transition-colors hover:bg-white/10"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full px-6 py-5 flex items-center justify-between text-left focus:outline-none cursor-pointer"
              >
                <span className="font-medium text-lg">{faq.question}</span>
                <ChevronDown 
                  className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${openIndex === index ? 'rotate-180' : ''}`} 
                />
              </button>
              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="px-6 pb-5 text-gray-300 leading-relaxed">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
