import React from 'react';
import { Leaf, ShieldCheck, Brain, Heart, Wallet, Wind } from 'lucide-react';

const features = [
  { icon: Brain, label: "Apgauk Smegenis" },
  { icon: ShieldCheck, label: "Saugok Plaučius" },
  { icon: Wallet, label: "Sutaupyk Pinigų" },
  { icon: Heart, label: "Nutrauk Grandinę", highlight: true },
  { icon: Leaf, label: "Jokių Toksinų" },
  { icon: Wind, label: "Naudok Visur" },
];

const FeaturesGrid: React.FC = () => {
  return (
    <section id="facts" className="py-20 bg-warmWhite relative overflow-hidden">
      {/* Subtle Background Element */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-softGreen/5 to-transparent pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-darkCharcoal mb-4">Kodėl Tai Veikia?</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">Tai ne magija. Tai psichologija. Mes pašalinome chemiją, bet palikome ritualą.</p>
          <div className="h-1 w-20 bg-forestGreen mx-auto rounded-full mt-6"></div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {features.map((feature, idx) => (
            <div 
              key={idx} 
              className={`flex flex-col items-center text-center group p-6 rounded-2xl transition-all duration-300 border ${feature.highlight 
                ? 'bg-white border-neon/50 shadow-[0_0_30px_-10px_rgba(74,222,128,0.3)] scale-105 z-10' 
                : 'bg-white/50 border-transparent hover:bg-white hover:shadow-lg hover:-translate-y-1'}`}
            >
              <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-4 transition-all duration-300 ${feature.highlight 
                ? 'bg-neon/10 text-forestGreen shadow-inner' 
                : 'bg-warmWhite group-hover:bg-softGreen/10 text-forestGreen'}`}>
                <feature.icon size={28} strokeWidth={1.5} className={feature.highlight ? 'drop-shadow-sm' : ''} />
              </div>
              <h3 className={`font-medium text-sm md:text-base ${feature.highlight ? 'text-forestGreen font-bold' : 'text-darkCharcoal'}`}>
                {feature.label}
              </h3>
              {feature.highlight && (
                 <span className="text-[10px] font-bold text-neon uppercase tracking-widest mt-1 bg-forestDark px-2 py-0.5 rounded-full">Svarbiausia</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesGrid;