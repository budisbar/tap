import { motion } from 'motion/react';

const reasons = [
  {
    title: "Remove the Friction",
    description: "Customers are often too bored or distracted to search for your business online. NFC makes leaving a 5-star review instant, effortless, and actually pleasing."
  },
  {
    title: "Boost Local SEO",
    description: "Google's algorithm favors businesses with a high frequency of positive reviews, ranking them higher in local 'near me' search results."
  },
  {
    title: "Build Instant Trust",
    description: "A steady stream of recent, authentic reviews shows potential customers that your business is highly active, popular, and incredibly reliable."
  }
];

export default function WhyReviews() {
  return (
    <section
      id="why-reviews"
      className="py-28 md:py-36 relative overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, #050505 0%, #0a0a0a 20%, #0a0a0a 80%, #050505 100%)'
      }}
    >
      {/* Background Glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] pointer-events-none select-none z-0"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0) 70%)'
        }}
      />

      <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-20">
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
            In today's digital and AI-driven landscape, your reputation is everything. Frictionless feedback isn't just nice to have, it's essential for dominating search algorithms and landing future clients.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-16 lg:gap-20">
          {reasons.map((reason) => (
            <div key={reason.title} className="text-left">
              <h3 className="text-2xl md:text-3xl lg:text-4xl font-serif font-light text-white tracking-tight leading-tight mb-5">
                {reason.title}
              </h3>
              <p className="text-base md:text-lg text-gray-400 font-light leading-relaxed">
                {reason.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
