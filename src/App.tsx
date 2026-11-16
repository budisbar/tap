import { useState, useEffect, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, useLocation, useNavigate, Navigate } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import PagePreloader, { NfcPulseLogo } from './components/layout/PagePreloader';
import Hero from './components/sections/Hero';
import WhyReviews from './components/sections/WhyReviews';
import Products from './components/sections/Products';
import Contact from './components/sections/Contact';
import Footer from './components/layout/Footer';
import CustomQuote from './components/sections/CustomQuote';
import FAQ from './components/sections/FAQ';
import AuthModal from './components/modals/AuthModal';
import EcoFriendly from './components/sections/EcoFriendly';
import PrintingMethods from './components/sections/PrintingMethods';
import { db, User } from './lib/mockDb';

const CardCustomizer = lazy(() => import('./components/studio/CardCustomizer'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const ClientPortal = lazy(() => import('./pages/ClientPortal'));
const UserAccount = lazy(() => import('./pages/UserAccount'));

// Loader component for Suspense
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-[#050505]">
    <NfcPulseLogo />
  </div>
);

function AppContent() {
  const [user, setUser] = useState<User | null>(() => db.getCurrentUser());
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const isHomePage = location.pathname === '/';
  const isAdmin = location.pathname === '/admin';

  // Handle scrolling when on home page
  useEffect(() => {
    if (isHomePage && location.hash) {
      setTimeout(() => {
        const id = location.hash.replace('#', '');
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else if (!location.hash) {
      window.scrollTo(0, 0);
    }
  }, [location, isHomePage]);

  return (
    <div className="min-h-screen bg-[#050505] text-gray-200 relative">
      <PagePreloader />
      <div className="fixed inset-0 pointer-events-none -z-10 transform-gpu" style={{ backgroundImage: 'radial-gradient(circle at top right, #1a1a1a 0%, #050505 60%)' }} />

      {/* The Main Content */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {!isAdmin && <Navbar user={user} onAuthClick={() => setIsAuthModalOpen(true)} />}
        
        <main className="flex-grow">
            <Routes>
              <Route path="/" element={
                <>
                  <Hero />
                  <Products />
                  <WhyReviews />
                  <EcoFriendly />
                  <PrintingMethods />
                  <CustomQuote />
                  <FAQ />
                  <Contact />
                </>
              } />
              <Route path="/studio" element={
                <Suspense fallback={<PageLoader />}>
                  <div className="pt-24 pb-12 min-h-screen">
                    <CardCustomizer />
                  </div>
                </Suspense>
              } />
              <Route path="/portal" element={
                user ? (
                  <Suspense fallback={<PageLoader />}>
                    <ClientPortal 
                      user={user} 
                      onOpenProject={(id) => navigate(`/studio?project=${id}`)}
                      onNewProject={(type: 'card' | 'board') => navigate(`/studio?type=${type}`)}
                    />
                  </Suspense>
                ) : (
                  <Navigate to="/" replace />
                )
              } />
              <Route path="/account" element={
                user ? (
                  <Suspense fallback={<PageLoader />}>
                    <UserAccount 
                      user={user} 
                      onLogout={() => {
                        setUser(null);
                        navigate('/');
                      }}
                    />
                  </Suspense>
                ) : (
                  <Navigate to="/" replace />
                )
              } />
              <Route path="/admin" element={
                <Suspense fallback={<PageLoader />}>
                  <div className="min-h-screen">
                    <AdminDashboard onExit={() => navigate('/')} />
                  </div>
                </Suspense>
              } />
            </Routes>
        </main>

        {!isAdmin && <Footer />}
      </div>
      
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
        onSuccess={() => setUser(db.getCurrentUser())} 
      />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
