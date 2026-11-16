import { useState, useEffect, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, useLocation, useNavigate, Navigate } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import PagePreloader, { NfcPulseLogo } from './components/layout/PagePreloader';
import ScrollSection from './components/ui/ScrollSection';
import Hero from './components/sections/Hero';
import WhyReviews from './components/sections/WhyReviews';
import Products from './components/sections/Products';
import Contact from './components/sections/Contact';
import Footer from './components/layout/Footer';
import CustomQuote from './components/sections/CustomQuote';
import FAQ from './components/sections/FAQ';
import EcoFriendly from './components/sections/EcoFriendly';
import PrintingMethods from './components/sections/PrintingMethods';
import NotFound from './pages/NotFound';
import { dataService, User } from './lib/dataService';
import { applyRouteSeo } from './lib/seo';

const AuthModal = lazy(() => import('./components/modals/AuthModal'));
const CardCustomizer = lazy(() => import('./components/studio/CardCustomizer'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const AdminOrderPage = lazy(() => import('./pages/AdminOrderPage'));
const ClientPortal = lazy(() => import('./pages/ClientPortal'));
const UserAccount = lazy(() => import('./pages/UserAccount'));

// Loader component for Suspense
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-[#050505]">
    <NfcPulseLogo />
  </div>
);

export function AppContent() {
  const [user, setUser] = useState<User | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const isHomePage = location.pathname === '/';
  const isAdmin = location.pathname.startsWith('/admin');
  const isStudio = location.pathname === '/studio';

  useEffect(() => {
    const unsub = dataService.onAuthChange((currentUser) => {
      setUser(currentUser);
      setAuthChecked(true);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    applyRouteSeo(location.pathname);
  }, [location.pathname]);

  // Handle scrolling when on home page
  useEffect(() => {
    if (isHomePage && location.hash) {
      setTimeout(() => {
        const id = location.hash.replace('#', '');
        document.getElementById(id)?.scrollIntoView({
          behavior: 'smooth',
          block: id === 'hero' ? 'start' : 'center',
        });
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
                <ScrollSection isFirst>
                  <Hero />
                </ScrollSection>
                <ScrollSection>
                  <Products />
                </ScrollSection>
                <ScrollSection>
                  <WhyReviews />
                </ScrollSection>
                <ScrollSection>
                  <EcoFriendly />
                </ScrollSection>
                <ScrollSection>
                  <PrintingMethods />
                </ScrollSection>
                <ScrollSection>
                  <CustomQuote />
                </ScrollSection>
                <ScrollSection>
                  <FAQ />
                </ScrollSection>
                <ScrollSection isLast blendFromDarkToLight>
                  <Contact />
                </ScrollSection>
              </>
            } />
            <Route path="/studio" element={
              <Suspense fallback={<PageLoader />}>
                <div className="pt-[75px] h-dvh overflow-hidden flex flex-col">
                  <CardCustomizer />
                </div>
              </Suspense>
            } />
            <Route path="/portal" element={
              !authChecked ? (
                <PageLoader />
              ) : user ? (
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
              !authChecked ? (
                <PageLoader />
              ) : user ? (
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
            <Route path="/admin/orders/:orderId" element={
              <Suspense fallback={<PageLoader />}>
                <AdminOrderPage />
              </Suspense>
            } />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>

        {!isAdmin && !isStudio && <Footer />}
      </div>

      {isAuthModalOpen && (
        <Suspense fallback={null}>
          <AuthModal
            isOpen={isAuthModalOpen}
            onClose={() => setIsAuthModalOpen(false)}
            onSuccess={() => setUser(dataService.getCurrentUser())}
          />
        </Suspense>
      )}
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
