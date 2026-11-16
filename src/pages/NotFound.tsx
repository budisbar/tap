import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <section className="min-h-screen flex items-center justify-center bg-[#050505] text-white px-6 pt-20">
      <div className="max-w-xl mx-auto text-center">
        <p className="text-xs font-bold uppercase tracking-[0.4em] text-gray-500 mb-4">Error 404</p>
        <h1 className="text-5xl md:text-6xl font-black tracking-tight mb-4">Page Not Found</h1>
        <p className="text-gray-400 text-base md:text-lg font-light leading-relaxed mb-8">
          The page you are looking for does not exist or has been moved. Explore our custom NFC cards or open the Design Studio.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/"
            className="px-6 py-3 bg-white text-black font-semibold rounded-sm hover:bg-gray-200 transition-colors text-sm"
          >
            Return Home
          </Link>
          <Link
            to="/studio"
            className="px-6 py-3 border border-white/20 text-white font-semibold rounded-sm hover:bg-white/10 transition-colors text-sm"
          >
            Open Design Studio
          </Link>
        </div>
      </div>
    </section>
  );
}
