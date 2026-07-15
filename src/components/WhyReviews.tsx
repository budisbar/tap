import { motion } from 'motion/react';

export default function WhyReviews() {
  const reasons = [
    {
      title: "Remove the Friction",
      description: "Customers are often too bored or distracted to search for your business online. NFC makes leaving a 5-star review instant, effortless, and actually pleasing."
    },
    {
      title: "AI-Driven Discovery",
      description: "People now use AI like ChatGPT to plan trips and find services. AI relies heavily on review volume and scores to evaluate and recommend places."
    },
    {
      title: "Boost Local SEO",
      description: "Google's algorithm favors businesses with a high frequency of positive reviews, ranking them higher in local 'near me' search results."
    },
    {
      title: "Build Instant Trust",
      description: "A steady stream of recent, authentic reviews shows potential customers that your business is highly active, popular, and incredibly reliable."
    },
    {
      title: "93% Read Reviews",
      description: "The vast majority of modern consumers will read online reviews before deciding to purchase a product or visit a physical location."
    }
  ];

  return (
    <section className="py-24 bg-[#0a0a0a] border-y border-white/5 relative overflow-hidden">
      {/* CSS for infinite marquee */}
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(calc(-50% - 12px)); } /* Accounts for gap */
        }
        .animate-marquee {
          animation: marquee 40s linear infinite;
          display: flex;
          width: max-content;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>

      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-white/5 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="w-full relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-12 px-6 lg:px-12">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-serif font-light text-white mb-6"
          >
            Why Optimization <span className="italic font-normal text-gray-400">Matters</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-lg text-gray-400 font-light leading-relaxed"
          >
            In today's digital and AI-driven landscape, your reputation is everything. Frictionless feedback isn't just nice to have—it's essential for dominating search algorithms and landing future clients.
          </motion.p>
        </div>

        {/* Infinite Scrolling Marquee */}
        <div className="w-full overflow-hidden py-10">
          <div className="animate-marquee gap-6 px-3">
            {[...reasons, ...reasons].map((reason, index) => (
              <div
                key={index}
                className="w-[320px] md:w-[380px] shrink-0 bg-[#111] border border-white/10 p-8 rounded-2xl transition-all duration-300 group relative h-72 overflow-hidden flex flex-col items-center justify-center cursor-pointer shadow-[0_10px_30px_rgba(0,0,0,0.5)] hover:scale-110 hover:z-20 hover:border-white/30 hover:shadow-[0_30px_60px_rgba(255,255,255,0.05)]"
              >
                <h3 className="text-2xl font-bold text-white text-center absolute transition-all duration-300 group-hover:-translate-y-16 group-hover:scale-95 px-4 w-full">
                  {reason.title}
                </h3>
                
                <p className="text-gray-400 font-light leading-relaxed text-center text-sm md:text-base absolute opacity-0 translate-y-16 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-4 px-6 w-full">
                  {reason.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
