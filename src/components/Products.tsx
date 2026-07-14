import { motion } from 'motion/react';
import { Star, Wifi, Utensils, Zap } from 'lucide-react';

const products = [
  {
    id: 'reviews',
    title: 'Review Boost Cards',
    description: 'Take customers directly to your Google or TripAdvisor review page with a single tap. Explode your 5-star ratings instantly.',
    icon: Star,
    color: 'text-amber-500',
    bg: 'bg-amber-100'
  },
  {
    id: 'menu',
    title: 'Digital Menu Cards',
    description: 'Replace dirty paper menus. Customers tap to view your always-updated, beautiful digital menu right on their phones.',
    icon: Utensils,
    color: 'text-emerald-500',
    bg: 'bg-emerald-100'
  },
  {
    id: 'wifi',
    title: 'Wi-Fi Connect Cards',
    description: 'No more spelling out complex passwords. A simple tap connects your guests securely to your guest Wi-Fi network.',
    icon: Wifi,
    color: 'text-blue-500',
    bg: 'bg-blue-100'
  }
];

export default function Products() {
  return (
    <section id="products" className="py-24 relative bg-transparent border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl md:text-5xl font-serif font-light text-white mb-6">Smart Cards for Smart Businesses</h2>
          <p className="text-lg text-gray-400 font-light">
            Our custom-branded NFC cards are designed to remove friction from your customer experience. No apps required—just tap and go.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {products.map((product, index) => {
            return (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="h-64 bg-[#111] border border-white/10 rounded-2xl p-8 flex flex-col justify-between shadow-[0_0_30px_rgba(0,0,0,0.5)] hover:bg-gradient-to-br hover:from-zinc-800 hover:to-black hover:border-white/20 transition-all group"
              >
                <div className="flex justify-between items-start">
                  <div className="w-8 h-8 rounded border border-white/20 flex items-center justify-center text-[10px] text-gray-500 font-mono">0{index + 1}</div>
                  <div className="text-white font-bold tracking-widest text-[10px] uppercase font-sans">{product.title.split(' ')[0]}</div>
                </div>
                <div>
                  <div className="w-12 h-[2px] bg-white/20 mb-4 group-hover:bg-white/40 transition-colors"></div>
                  <h3 className="text-2xl font-light text-white mb-2 italic font-serif">{product.title}</h3>
                  <p className="text-sm text-gray-400 leading-tight">
                    {product.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
