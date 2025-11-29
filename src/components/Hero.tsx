import React from 'react';
import Button from './Button';
import { ArrowDown } from 'lucide-react';
const deviceImage = '/wp-content/themes/oru-theme/dist/images/device.png';
console.log('Device image path:', deviceImage);
const Hero: React.FC = () => {
  return (
    <section className="relative min-h-screen flex items-center bg-forestDark overflow-hidden pt-24 lg:pt-0">
      {/* Static Background Layers */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-[#0f3920] via-forestDark to-[#020d05]"></div>
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-softGreen/5 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-forestGreen/5 rounded-full blur-[80px] pointer-events-none"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          
          {/* Left Side: Text Content */}
          <div className="text-center lg:text-left space-y-8 animate-fade-in-up">
            
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 border border-red-500/20 backdrop-blur-md transition-colors cursor-default">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_10px_#ef4444]"></span>
                <span className="text-red-400 text-xs font-bold uppercase tracking-widest">Sprendimas, kurio tau reikia</span>
            </div>
            
            <h1 className="text-5xl sm:text-6xl lg:text-8xl font-serif font-bold text-white leading-[1.1] tracking-tight drop-shadow-2xl">
              Susigrąžink <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon via-emerald-400 to-emerald-600 italic">Kontrolę.</span>
            </h1>
            
            <div className="space-y-4">
              <p className="text-xl text-gray-200 leading-relaxed max-w-lg mx-auto lg:mx-0 font-light border-l-4 border-neon pl-6">
                 Rūkymas valdo tavo laiką, sveikatą ir pinigus. <br/>
                 <strong className="text-white">ORU</strong> yra tavo įrankis apgauti smegenis: išsaugok ritualą, bet <span className="text-neon underline underline-offset-4 decoration-1">pašalink nuodus</span>.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-5 pt-4 justify-center lg:justify-start">
              <Button 
                onClick={() => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth'})} 
                className="shadow-[0_0_30px_-5px_rgba(74,222,128,0.4)] text-lg px-10 py-4 bg-neon text-forestDark hover:bg-white"
              >
                Mesti Rūkyti Dabar
              </Button>
              <Button 
                variant="outline" 
                className="border-white/20 text-white hover:bg-white/10 hover:text-white hover:border-white/50 text-lg px-10 py-4" 
                onClick={() => document.getElementById('facts')?.scrollIntoView({ behavior: 'smooth'})}
              >
                Kaip Tai Veikia?
              </Button>
            </div>

            {/* Stats */}
            <div className="flex gap-12 pt-10 border-t border-white/10 justify-center lg:justify-start opacity-90">
               <div className="text-center lg:text-left">
                  <p className="text-3xl font-serif font-bold text-white">0%</p>
                  <p className="text-xs text-neon uppercase tracking-wider">Priklausomybės</p>
               </div>
               <div className="text-center lg:text-left">
                  <p className="text-3xl font-serif font-bold text-white">100%</p>
                  <p className="text-xs text-neon uppercase tracking-wider">Laisvės</p>
               </div>
            </div>
          </div>

          {/* Right Side: Device Image */}
          <div className="relative h-[600px] flex items-center justify-center lg:justify-end w-full z-20">
            
            {/* 0% Nicotine Badge */}
            <div className="absolute top-0 right-4 lg:-right-8 z-50 animate-float" style={{ animationDelay: '1s', willChange: 'transform' }}>
                <div className="w-32 h-32 rounded-full bg-warmWhite shadow-[0_0_50px_rgba(74,222,128,0.4)] flex flex-col items-center justify-center transform rotate-12 border-4 border-neon/50 group hover:scale-110 transition-transform duration-300">
                    <span className="text-5xl font-bold text-forestDark leading-none">0%</span>
                    <span className="text-xs font-bold text-red-500 uppercase tracking-widest mt-1">Nikotino</span>
                </div>
            </div>

            {/* Glow behind device */}
            <div className="absolute top-1/2 left-1/2 lg:left-2/3 -translate-x-1/2 -translate-y-1/2 w-[250px] h-[500px] bg-neon/20 blur-3xl rounded-full pointer-events-none mix-blend-screen"></div>

            {/* Device Image Container */}
            <div className="relative z-30 mr-0 lg:mr-20 select-none pointer-events-none rotate-6 animate-fade-in-up transition-transform duration-700 hover:rotate-0">
              
              {/* 
                  REPLACE src below with your actual image path (e.g. "/device.png").
                  I am using a placeholder here so you can see where it goes.
              */}
<img 
  src={deviceImage}
  alt="ORU Device"
  className="w-full h-auto max-w-md drop-shadow-2xl"
/>

              {/* Floating Annotations */}
              <div className="absolute top-[20%] -left-40 hidden sm:flex items-center justify-end w-40 animate-fade-in-up opacity-0" style={{ animationDelay: '0.5s', animationFillMode: 'forwards' }}>
                  <div className="bg-black/80 backdrop-blur text-white text-xs px-3 py-1.5 rounded border border-white/10 mr-2 shadow-xl text-right">
                    <span className="block font-bold text-neon">Ergonomiška</span>
                    <span className="text-[10px] text-gray-300">Kandiklio forma</span>
                  </div>
                  <div className="w-10 h-px bg-white/50"></div>
                  <div className="w-2 h-2 bg-neon rounded-full -ml-1 shadow-[0_0_10px_#4ade80]"></div>
              </div>

              <div className="absolute top-[65%] -right-40 hidden sm:flex items-center w-40 animate-fade-in-up opacity-0" style={{ animationDelay: '0.7s', animationFillMode: 'forwards' }}>
                  <div className="w-2 h-2 bg-neon rounded-full -mr-1 shadow-[0_0_10px_#4ade80] z-10"></div>
                  <div className="w-10 h-px bg-white/50"></div>
                  <div className="bg-black/80 backdrop-blur text-white text-xs px-3 py-1.5 rounded border border-neon/30 ml-2 shadow-xl">
                     <span className="block font-bold text-neon">Natūralus</span>
                     <span className="text-[10px] text-gray-300">Riešutmedis</span>
                  </div>
              </div>

            </div>
          </div>

        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce text-neon opacity-70 hidden md:block cursor-pointer z-40" onClick={() => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth'})}>
          <div className="flex flex-col items-center gap-2">
            <span className="text-[10px] uppercase tracking-widest text-white/50">Pradėti</span>
            <ArrowDown size={24} />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;