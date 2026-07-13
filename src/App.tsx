/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import WhyReviews from './components/WhyReviews';
import Products from './components/Products';
import CardCustomizer from './components/CardCustomizer';
import Contact from './components/Contact';
import Footer from './components/Footer';

export default function App() {
  const [currentPage, setCurrentPage] = useState<'home' | 'studio'>('home');

  const goToContact = () => {
    setCurrentPage('home');
    setTimeout(() => {
      document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-gray-200 selection:bg-white/20 selection:text-white" style={{ backgroundImage: 'radial-gradient(circle at top right, #1a1a1a 0%, #050505 60%)' }}>
      <Navbar currentPage={currentPage} setCurrentPage={setCurrentPage} />
      <main>
        {currentPage === 'home' ? (
          <>
            <Hero />
            <WhyReviews />
            <Products />
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
  );
}
