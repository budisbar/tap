import { motion } from 'motion/react';
import { Star, TrendingUp, Users } from 'lucide-react';

export default function WhyReviews() {
  const stats = [
    {
      icon: Star,
      title: "93% of customers",
      description: "read online reviews before deciding to purchase a product or use a service."
    },
    {
      icon: TrendingUp,
      title: "Boost Local SEO",
      description: "Google favors businesses with more positive reviews, ranking them higher in local search results."
    },
    {
      icon: Users,
      title: "Build Trust Instantly",
      description: "A steady stream of recent reviews shows potential customers that your business is active and reliable."
    }
  ];

  return (
    <section className="py-24 bg-[#0a0a0a] border-y border-white/5 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-white/5 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-serif font-light text-white mb-6"
          >
            Why Reviews <span className="italic font-normal text-gray-400">Matter</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-lg text-gray-400 font-light leading-relaxed"
          >
            In today's digital landscape, your reputation is everything. Engaging with your customers and collecting feedback isn't just nice to have—it's essential for growth and landing future clients.
          </motion.p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 + 0.2 }}
              className="bg-[#111] border border-white/10 p-8 rounded-2xl hover:border-white/20 transition-colors group"
            >
              <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-6 group-hover:bg-white/10 transition-colors">
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-4">{stat.title}</h3>
              <p className="text-gray-400 font-light leading-relaxed text-sm">
                {stat.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
