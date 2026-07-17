/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, useScroll, useMotionValueEvent } from 'motion/react';
import IntroGate from './components/IntroGate';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import WhyReviews from './components/WhyReviews';
import Products from './components/Products';
import CardCustomizer from './components/CardCustomizer';
import Contact from './components/Contact';
import Footer from './components/Footer';

export default function App() {
  const [currentPage, setCurrentPage] = useState<'home' | 'studio'>('home');
  // Check if this is the first time visiting in this session
  const [hasSeenIntro, setHasSeenIntro] = useState(() => {
    return sessionStorage.getItem('hasSeenIntro') === 'true';
  });

  const { scrollY } = useScroll();
  const gateHeight = 1500;
  
  // Use CSS fixed positioning to perfectly lock the page without jitter
  const [isPinned, setIsPinned] = useState(true);

  useMotionValueEvent(scrollY, "change", (latest) => {
    if (latest >= gateHeight && isPinned) setIsPinned(false);
    else if (latest < gateHeight && !isPinned) setIsPinned(true);
  });

  // Mark intro as seen once they scroll past the gate
  useEffect(() => {
    if (hasSeenIntro) return;
    const unsubscribe = scrollY.onChange((latest) => {
      if (latest >= gateHeight) {
        sessionStorage.setItem('hasSeenIntro', 'true');
        setHasSeenIntro(true);
        window.scrollTo({ top: 0, behavior: 'instant' });
      }
    });
    return () => unsubscribe();
  }, [scrollY, gateHeight, hasSeenIntro]);

  const goToContact = () => {
    setCurrentPage('home');
    setTimeout(() => {
      document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-gray-200 selection:bg-white/20 selection:text-white" style={{ backgroundImage: 'radial-gradient(circle at top right, #1a1a1a 0%, #050505 60%)', backgroundAttachment: 'fixed' }}>
      
      {/* The Full Screen Intro Gate */}
      {currentPage === 'home' && !hasSeenIntro && (
        <div className="w-full relative z-[100]" style={{ height: `calc(${gateHeight}px + 100vh)` }}>
          <IntroGate scrollY={scrollY} gateHeight={gateHeight} />
        </div>
      )}

      {/* The Pinned Main Content */}
      <div 
        className={`z-10 ${currentPage === 'home' && !hasSeenIntro ? (isPinned ? 'fixed inset-0 overflow-hidden' : 'absolute w-full') : 'relative'}`} 
        style={currentPage === 'home' && !hasSeenIntro && !isPinned ? { top: `${gateHeight}px` } : {}}
      >
        <div className="w-full h-full">
          <Navbar currentPage={currentPage} setCurrentPage={setCurrentPage} />
          <main>
            {currentPage === 'home' ? (
              <>
                <Hero onDesignCard={() => { setCurrentPage('studio'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} />
                <Products />
                <WhyReviews />
                <Contact />
              </>
            ) : (
              <div className="pt-24 pb-12 min-h-screen">
                <CardCustomizer onBookMeeting={goToContact} />
              </div>
            )}
          </main>
          <Footer onHomeClick={() => { setCurrentPage('home'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} />
        </div>
      </div>
    </div>
  );
}
