import React from 'react';
import { Heart, Target, Users, Award } from 'lucide-react';

const AboutUs: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f0fdf4] to-white">
      
      {/* Hero Section */}
      <section className="py-20 px-4 bg-[#15803d] text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-6">Apie Mus</h1>
          <p className="text-xl text-white/90">
            Padedame žmonėms mesti rūkyti natūraliu būdu
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
            <div className="flex items-center gap-4 mb-6">
              <Target className="text-[#15803d]" size={48} />
              <h2 className="text-3xl font-bold text-[#1a1a1a]">Mūsų Misija</h2>
            </div>
            <p className="text-lg text-gray-700 leading-relaxed mb-4">
              Mes tikime, kad kiekvienas žmogus turi teisę į sveiką gyvenimą be cigarečių. 
              Mūsų tikslas – padėti žmonėms natūraliu būdu sumažinti ir galiausiai visiškai 
              atsisakyti rūkymo.
            </p>
            <p className="text-lg text-gray-700 leading-relaxed">
              Naudodami tik natūralius ingredientus ir modernią technologiją, mes sukūrėme 
              produktą, kuris padeda įveikti rūkymo įprotį be streso ir neigiamų šalutinių 
              poveikių.
            </p>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-[#1a1a1a] mb-12">
            Mūsų Vertybės
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
              <div className="w-16 h-16 bg-[#15803d] rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="text-white" size={32} />
              </div>
              <h3 className="text-xl font-bold text-[#1a1a1a] mb-3">Sveikata Pirmoje Vietoje</h3>
              <p className="text-gray-600">
                Naudojame tik natūralius, saugius ingredientus. Be nikotino, 
                be kenksmingų cheminių medžiagų.
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
              <div className="w-16 h-16 bg-[#15803d] rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="text-white" size={32} />
              </div>
              <h3 className="text-xl font-bold text-[#1a1a1a] mb-3">Klientų Pasitenkinimas</h3>
              <p className="text-gray-600">
                Jūsų sėkmė – mūsų sėkmė. Teikiame nuolatinę pagalbą ir 
                palaikymą visame kelyje.
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
              <div className="w-16 h-16 bg-[#15803d] rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="text-white" size={32} />
              </div>
              <h3 className="text-xl font-bold text-[#1a1a1a] mb-3">Kokybė ir Inovacijos</h3>
              <p className="text-gray-600">
                Nuolat tobuliname savo produktus, kad jie būtų efektyvūs 
                ir malonūs naudoti.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-[#1a1a1a] mb-8">
            Mūsų Istorija
          </h2>
          <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
            <p className="text-lg text-gray-700 leading-relaxed mb-4">
              freshera gimė iš asmeninės patirties ir noro padėti kitiems. Mūsų įkūrėjai, 
              patys buvę rūkaliai, suprato, kaip sunku mesti šį įprotį tradiciniais būdais.
            </p>
            <p className="text-lg text-gray-700 leading-relaxed mb-4">
              Po metų tyrimų ir eksperimentų su natūraliais skoniais, gimė revoliucinis 
              sprendimas – įrenginys su skonių filtrais, kuris padeda palaipsniui sumažinti 
              cigarečių poreikį.
            </p>
            <p className="text-lg text-gray-700 leading-relaxed">
              Šiandien mes didžiuojamės padėdami tūkstančiams žmonių visoje Lietuvoje 
              ir Baltijos šalyse. Kiekvienas sėkmės atvejis motyvuoja mus toliau tobulėti 
              ir kurti geriausius produktus.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-[#15803d] to-[#16a34a] text-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-5xl font-bold mb-2">5000+</div>
              <div className="text-white/90">Patenkintų Klientų</div>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">20</div>
              <div className="text-white/90">Unikalių Skonių</div>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">95%</div>
              <div className="text-white/90">Sėkmės Rodiklis</div>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">100%</div>
              <div className="text-white/90">Natūralu</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-[#1a1a1a] mb-6">
            Prisijunkite Prie Mūsų Bendruomenės
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Tūkstančiai žmonių jau pasitiki mumis. Būkite kitas!
          </p>
          <a 
            href="/#bundles"
            className="inline-block bg-[#15803d] text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-[#15803d]/90 transition-all shadow-lg"
          >
            Pradėti Dabar
          </a>
        </div>
      </section>

    </div>
  );
};

export default AboutUs;