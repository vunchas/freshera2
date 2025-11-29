import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AnnouncementBar from './components/AnnouncementBar.tsx';
import Navbar from './components/Navbar.tsx';
import Home from './pages/Home.tsx';
import AboutUs from './pages/AboutUs.tsx';
import Contact from './pages/Contact.tsx';
import PrivacyPolicy from './pages/PrivacyPolicy.tsx';
import TermsAndConditions from './pages/TermsAndConditions.tsx';
import CheckoutRouter from './pages/CheckoutRouter';
import CheckoutFull from './pages/CheckoutFull';
import CheckoutFilters from './pages/CheckoutFilters';
import CheckoutCouple from './pages/CheckoutCouple';
import Footer from './components/Footer.tsx';
import CartDrawer from './components/CartDrawer.tsx';
import { CartProvider } from './context/CartContext.tsx';

const App: React.FC = () => {
  return (
    <CartProvider>
      <Router>
        <div className="font-sans text-darkCharcoal antialiased selection:bg-softGreen selection:text-white flex flex-col min-h-screen">
          <AnnouncementBar />
          
          <div className="relative flex-grow">
            <Routes>
              {/* Home Page */}
              <Route path="/" element={
                <>
                  <Navbar />
                  <Home />
                  <Footer />
                </>
              } />

              {/* About Us Page */}
              <Route path="/about" element={
                <>
                  <Navbar />
                  <AboutUs />
                  <Footer />
                </>
              } />

              {/* Contact Page */}
              <Route path="/contact" element={
                <>
                  <Navbar />
                  <Contact />
                  <Footer />
                </>
              } />

              {/* Privacy Policy Page */}
              <Route path="/privacy-policy" element={
                <>
                  <Navbar />
                  <PrivacyPolicy />
                  <Footer />
                </>
              } />

              {/* Terms and Conditions Page */}
              <Route path="/terms" element={
                <>
                  <Navbar />
                  <TermsAndConditions />
                  <Footer />
                </>
              } />

              {/* Checkout Routes - Smart Routing System */}
              <Route path="/checkout" element={<CheckoutRouter />} />
              <Route path="/checkout/full" element={<CheckoutFull />} />
              <Route path="/checkout/filters" element={<CheckoutFilters />} />
              <Route path="/checkout/couple" element={<CheckoutCouple />} />
            </Routes>
          </div>
          
          <CartDrawer />
        </div>
      </Router>
    </CartProvider>
  );
};

export default App;