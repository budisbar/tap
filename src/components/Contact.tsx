import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Calendar, MessageSquare, Building2, User, Mail } from 'lucide-react';

export default function Contact() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          access_key: "76c3e805-f22f-4983-ac74-ece131e29225",
          subject: "New Contact from Tap & Con",
          from_name: "Tap & Con Website",
          name: name,
          email: email,
          message: message,
        }),
      });
      
      const result = await response.json();
      if (result.success) {
        setSubmitStatus('success');
        setName('');
        setEmail('');
        setMessage('');
      } else {
        setSubmitStatus('error');
      }
    } catch (error) {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

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
                Optimize Your Business.
              </h2>
              <p className="text-lg opacity-60 mb-10 leading-relaxed max-w-md">
                Book a free consultation with our team. We'll show you how our NFC solutions can be customized for your brand to drive more reviews and delight customers.
              </p>
              
              <div className="space-y-8">
                <a href="https://mail.google.com/mail/?view=cm&fs=1&to=tapncon.info@gmail.com" target="_blank" rel="noopener noreferrer" className="flex items-start group transition-all hover:-translate-y-1">
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-12 h-12 rounded-full border border-black/20 flex items-center justify-center group-hover:bg-black group-hover:text-white transition-colors">
                      <Mail className="w-5 h-5 transition-colors" />
                    </div>
                  </div>
                  <div className="ml-5">
                    <h4 className="text-xl font-light text-black mb-1">Email Us</h4>
                    <p className="text-sm opacity-60">tapncon.info@gmail.com</p>
                  </div>
                </a>
                
                <a href="https://wa.me/351914422906" target="_blank" rel="noopener noreferrer" className="flex items-start group transition-all hover:-translate-y-1">
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-12 h-12 rounded-full border border-black/20 flex items-center justify-center group-hover:bg-[#25D366] group-hover:border-[#25D366] group-hover:text-white transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-5">
                    <h4 className="text-xl font-light text-black mb-1">WhatsApp</h4>
                    <p className="text-sm opacity-60">Chat with us directly</p>
                  </div>
                </a>
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
            <h3 className="text-[10px] uppercase tracking-widest font-bold mb-8">Send us an Email</h3>
            <form className="space-y-8" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="name" className="block text-[10px] uppercase tracking-widest font-bold mb-1">Full Name</label>
                <div className="relative">
                  <input type="text" id="name" value={name} onChange={e => setName(e.target.value)} required className="block w-full border-b border-black/20 pb-2 text-xl font-light focus:outline-none focus:border-black bg-transparent transition-colors" placeholder="John Doe" />
                </div>
              </div>
              
              <div>
                <label htmlFor="email" className="block text-[10px] uppercase tracking-widest font-bold mb-1">Email Address</label>
                <div className="relative">
                  <input type="email" id="email" value={email} onChange={e => setEmail(e.target.value)} required className="block w-full border-b border-black/20 pb-2 text-xl font-light focus:outline-none focus:border-black bg-transparent transition-colors" placeholder="john@company.com" />
                </div>
              </div>

              <div>
                <label htmlFor="message" className="block text-[10px] uppercase tracking-widest font-bold mb-1">Message</label>
                <div className="relative">
                  <textarea id="message" value={message} onChange={e => setMessage(e.target.value)} required rows={3} className="block w-full border-b border-black/20 pb-2 text-xl font-light focus:outline-none focus:border-black bg-transparent transition-colors resize-none" placeholder="How can we help you?"></textarea>
                </div>
              </div>

              {submitStatus === 'success' && (
                <div className="bg-green-50 text-green-800 p-4 rounded-md text-sm">
                  Your message has been sent successfully. We'll be in touch soon!
                </div>
              )}
              {submitStatus === 'error' && (
                <div className="bg-red-50 text-red-800 p-4 rounded-md text-sm">
                  There was an error sending your message. Please try again.
                </div>
              )}

              <button disabled={isSubmitting} type="submit" className={`w-full bg-black text-white px-10 py-5 font-bold uppercase tracking-widest transition-all mt-8 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:invert'}`}>
                {isSubmitting ? 'Sending...' : 'Send Email'}
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
