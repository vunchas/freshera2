import React from 'react';
import { Facebook, Instagram, Mail, Leaf } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer id="contact" className="bg-forestDark text-white pt-20 pb-10 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-16">
          
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-2xl font-bold tracking-widest">
              <Leaf className="text-neon" size={24} fill="#4ade80" />
              <span style={{ fontFamily: "'Quip Demo', serif" }}>fera</span>
            </div>
            <p className="text-gray-400 leading-relaxed text-sm">
              Natūralus pasirinkimas tavo laisvei. Be nikotino, be priklausomybės.
            </p>
          </div>

          {/* Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-serif font-bold text-neon">Informacija</h3>
            <ul className="space-y-2 text-gray-300 text-sm">
              <li><a href="/privacy-policy" className="hover:text-neon transition-colors">Privatumo politika</a></li>
              <li><a href="/terms" className="hover:text-neon transition-colors">Taisyklės</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h3 className="text-lg font-serif font-bold text-neon">Kontaktai</h3>
            <div className="flex items-center gap-2 text-gray-300 text-sm">
              <Mail size={16} className="text-neon" />
              <span>pagalba@freshera.lt</span>
            </div>
            <div className="flex gap-4 pt-2">
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-neon hover:text-forestDark transition-all duration-300 hover:scale-110">
                <Instagram size={20} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-neon hover:text-forestDark transition-all duration-300 hover:scale-110">
                <Facebook size={20} />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-xs">© 2025 FreshEra. Visos teisės saugomos.</p>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">Saugus apmokėjimas per</span>
            <div className="bg-white px-2 py-1 rounded text-xs font-bold text-darkCharcoal tracking-wider">
              MONTONIO
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;