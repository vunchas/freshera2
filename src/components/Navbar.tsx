import React, { useState } from 'react';
import { ShoppingBag, Menu, X, Leaf } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';

const Navbar: React.FC = () => {
  const { cartCount, setIsCartOpen } = useCart();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Skonių Rinkiniai', href: '/#bundles' },
    { label: 'Apie Mus', href: '/about' },
    { label: 'Kontaktai', href: '/contact' },
  ];

  return (
    <nav className="absolute top-0 w-full z-50 bg-gradient-to-b from-black/50 to-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-24">
          
          {/* Mobile Menu Button */}
          <button 
            className="md:hidden text-white"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 font-bold text-white tracking-widest group">
            <div className="relative">
               <Leaf className="text-neon transition-transform duration-300 group-hover:rotate-12" size={32} fill="#4ade80" />
               <div className="absolute inset-0 bg-neon blur-md opacity-40"></div>
            </div>
            <span className="drop-shadow-md text-3xl" style={{ fontFamily: "'Quip Demo', serif" }}>fera</span>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex space-x-8">
            {navLinks.map((link) => (
              <a 
                key={link.label} 
                href={link.href} 
                className="text-gray-200 hover:text-neon transition-colors font-medium text-sm uppercase tracking-wide relative after:content-[''] after:absolute after:w-0 after:h-0.5 after:bg-neon after:left-0 after:-bottom-1 after:transition-all hover:after:w-full"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Cart Icon */}
          <button 
            className="relative p-2 text-white hover:text-neon transition-colors group"
            onClick={() => setIsCartOpen(true)}
          >
            <div className="absolute inset-0 bg-white/10 rounded-full scale-0 group-hover:scale-100 transition-transform duration-300"></div>
            <ShoppingBag size={24} />
            {cartCount > 0 && (
              <span className="absolute top-0 right-0 bg-neon text-forestDark text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full shadow-lg border border-forestDark">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-forestDark border-t border-white/10 absolute w-full px-4 py-4 shadow-2xl animate-fade-in-up">
          <div className="flex flex-col space-y-4">
            {navLinks.map((link) => (
              <a 
                key={link.label} 
                href={link.href} 
                className="text-white text-lg font-medium hover:text-neon"
                onClick={() => setIsMenuOpen(false)}
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;