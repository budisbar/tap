/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import WhyReviews from './components/WhyReviews';
import Products from './components/Products';
import CardCustomizer from './components/CardCustomizer';
import Contact from './components/Contact';
import Footer from './components/Footer';
import AdminDashboard from './components/AdminDashboard';
import ClientPortal from './components/ClientPortal';
import AuthModal from './components/AuthModal';
import { db, User } from './lib/mockDb';

export default function App() {
  const [currentPage, setCurrentPage] = useState<'home' | 'studio' | 'admin' | 'portal'>('home');
  const [user, setUser] = useState<User | null>(() => db.getCurrentUser());
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  


  const goToContact = () => {
    setCurrentPage('home');
    setTimeout(() => {
      document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-gray-200 selection:bg-white/20 selection:text-white" style={{ backgroundImage: 'radial-gradient(circle at top right, #1a1a1a 0%, #050505 60%)', backgroundAttachment: 'fixed' }}>

      {/* The Main Content */}
      <div className="relative z-10">
        <div className="w-full h-full">
          {currentPage !== 'admin' && <Navbar currentPage={currentPage as any} setCurrentPage={setCurrentPage} user={user} onAuthClick={() => setIsAuthModalOpen(true)} />}
          <main>
            {currentPage === 'home' ? (
              <>
                <Hero onDesignCard={() => { setCurrentPage('studio'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} />
                <Products onUnlockAdmin={() => { setCurrentPage('admin'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} />
                <WhyReviews />
                <Contact />
              </>
            ) : currentPage === 'studio' ? (
              <div className="pt-24 pb-12 min-h-screen">
                <CardCustomizer onBookMeeting={goToContact} />
              </div>
            ) : currentPage === 'portal' ? (
              <ClientPortal 
                user={user!} 
                onLogout={() => { setUser(null); setCurrentPage('home'); }}
                onOpenProject={(projectId) => {
                  // Pass project ID down to CardCustomizer somehow? Or just route to studio for now
                  setCurrentPage('studio');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onNewProject={() => {
                  setCurrentPage('studio');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />
            ) : (
              <div className="min-h-screen">
                <AdminDashboard onExit={() => { setCurrentPage('home'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} />
              </div>
            )}
          </main>
          {currentPage !== 'admin' && <Footer onHomeClick={() => { setCurrentPage('home'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} />}
        </div>
      </div>
      
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
        onSuccess={() => setUser(db.getCurrentUser())} 
      />
    </div>
  );
}
