import React from 'react';
import { Shield, Lock, Eye, FileText, Mail, AlertCircle } from 'lucide-react';

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f0fdf4] to-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#15803d] to-[#16a34a] text-white py-16">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center justify-center mb-4">
            <Shield size={48} className="mr-3" />
            <h1 className="text-4xl font-bold">Privatumo Politika</h1>
          </div>
          <p className="text-center text-lg text-green-50 max-w-2xl mx-auto">
            freshera.lt gerbia jūsų privatumą ir įsipareigoja saugoti jūsų asmens duomenis
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        
        {/* Section 1 */}
        <section className="mb-12">
          <div className="flex items-start mb-4">
            <div className="flex-shrink-0 w-10 h-10 bg-[#15803d] text-white rounded-full flex items-center justify-center font-bold mr-4">
              1
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-[#1a1a1a] mb-3">
                Privatumo politikos tikslas
              </h2>
              <p className="text-gray-700 leading-relaxed">
                <strong>freshera.lt</strong> gerbia jūsų privatumą ir įsipareigoja saugoti jūsų asmens duomenis. 
                Ši privatumo politika paaiškina, kokius duomenis renkame, kaip juos naudojame ir kokias teises turite.
              </p>
            </div>
          </div>
        </section>

        {/* Section 2 */}
        <section className="mb-12">
          <div className="flex items-start mb-4">
            <div className="flex-shrink-0 w-10 h-10 bg-[#15803d] text-white rounded-full flex items-center justify-center font-bold mr-4">
              2
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-[#1a1a1a] mb-3">
                Kokius duomenis renkame?
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Mes galime rinkti šiuos duomenis:
              </p>
              
              <div className="space-y-4">
                <div className="bg-white border-l-4 border-[#15803d] p-4 rounded-r-lg shadow-sm">
                  <h3 className="font-bold text-[#15803d] mb-2 flex items-center">
                    <FileText size={20} className="mr-2" />
                    Tiesiogiai pateikti duomenys
                  </h3>
                  <p className="text-gray-700">
                    Kai susisiekiate su mumis per kontaktinę formą, el. paštu ar kitais būdais, galime rinkti 
                    jūsų vardą, el. pašto adresą ir kitą savanoriškai pateiktą informaciją.
                  </p>
                </div>

                <div className="bg-white border-l-4 border-[#15803d] p-4 rounded-r-lg shadow-sm">
                  <h3 className="font-bold text-[#15803d] mb-2 flex items-center">
                    <Eye size={20} className="mr-2" />
                    Automatiškai renkami duomenys
                  </h3>
                  <p className="text-gray-700">
                    Kai lankotės mūsų svetainėje, galime rinkti techninę informaciją, pvz., IP adresą, 
                    naršyklės tipą, operacinę sistemą ir naršymo veiklą per slapukus bei kitas sekimo technologijas.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3 */}
        <section className="mb-12">
          <div className="flex items-start mb-4">
            <div className="flex-shrink-0 w-10 h-10 bg-[#15803d] text-white rounded-full flex items-center justify-center font-bold mr-4">
              3
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-[#1a1a1a] mb-3">
                Kaip naudojame jūsų duomenis?
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Jūsų duomenis naudojame šiais tikslais:
              </p>
              
              <ul className="space-y-2">
                <li className="flex items-start">
                  <span className="text-[#15803d] mr-2 font-bold">•</span>
                  <span className="text-gray-700">Siekdami atsakyti į jūsų užklausas;</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#15803d] mr-2 font-bold">•</span>
                  <span className="text-gray-700">Tobulindami svetainės funkcionalumą ir naudotojo patirtį;</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#15803d] mr-2 font-bold">•</span>
                  <span className="text-gray-700">Analizuodami lankytojų srautus ir svetainės naudojimą;</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#15803d] mr-2 font-bold">•</span>
                  <span className="text-gray-700">Užtikrindami saugumą ir apsaugą nuo neteisėtos veiklos.</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Section 4 */}
        <section className="mb-12">
          <div className="flex items-start mb-4">
            <div className="flex-shrink-0 w-10 h-10 bg-[#15803d] text-white rounded-full flex items-center justify-center font-bold mr-4">
              4
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-[#1a1a1a] mb-3">
                Slapukai ir sekimo technologijos
              </h2>
              <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg mb-4">
                <div className="flex items-start">
                  <AlertCircle className="text-amber-600 mr-2 flex-shrink-0 mt-1" size={20} />
                  <p className="text-gray-700">
                    Mūsų svetainė naudoja slapukus, kad užtikrintų tinkamą jos veikimą ir pagerintų naudotojų patirtį.
                  </p>
                </div>
              </div>
              
              <p className="text-gray-700 leading-relaxed mb-4">
                Slapukai – tai mažos duomenų rinkmenos, kurios išsaugomos jūsų įrenginyje, kai lankotės svetainėje.
              </p>

              <p className="text-gray-700 leading-relaxed mb-3">
                Slapukus naudojame:
              </p>
              <ul className="space-y-2 mb-4">
                <li className="flex items-start">
                  <span className="text-[#15803d] mr-2 font-bold">•</span>
                  <span className="text-gray-700">Svetainės funkcionalumui užtikrinti;</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#15803d] mr-2 font-bold">•</span>
                  <span className="text-gray-700">Analizei ir statistikai (pvz., „Google Analytics"), siekiant suprasti, kaip lankytojai naudojasi svetaine;</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#15803d] mr-2 font-bold">•</span>
                  <span className="text-gray-700">Rinkodaros tikslams (jei taikoma).</span>
                </li>
              </ul>

              <p className="text-gray-700 leading-relaxed italic">
                Galite valdyti ar ištrinti slapukus savo naršyklės nustatymuose. Atkreipkite dėmesį, 
                kad išjungus kai kuriuos slapukus, svetainė gali neveikti taip, kaip tikėtasi.
              </p>
            </div>
          </div>
        </section>

        {/* Section 5 */}
        <section className="mb-12">
          <div className="flex items-start mb-4">
            <div className="flex-shrink-0 w-10 h-10 bg-[#15803d] text-white rounded-full flex items-center justify-center font-bold mr-4">
              5
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-[#1a1a1a] mb-3 flex items-center">
                <Lock size={24} className="mr-2" />
                Duomenų apsauga
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Mes imamės tinkamų techninių ir organizacinių priemonių, kad apsaugotume jūsų asmens 
                duomenis nuo neteisėtos prieigos, praradimo ar pakeitimo.
              </p>
            </div>
          </div>
        </section>

        {/* Section 6 */}
        <section className="mb-12">
          <div className="flex items-start mb-4">
            <div className="flex-shrink-0 w-10 h-10 bg-[#15803d] text-white rounded-full flex items-center justify-center font-bold mr-4">
              6
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-[#1a1a1a] mb-3">
                Duomenų saugojimo laikotarpis
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Jūsų duomenis saugosime tiek, kiek būtina numatytiems tikslams pasiekti, 
                arba kaip to reikalauja teisės aktai.
              </p>
            </div>
          </div>
        </section>

        {/* Section 7 */}
        <section className="mb-12">
          <div className="flex items-start mb-4">
            <div className="flex-shrink-0 w-10 h-10 bg-[#15803d] text-white rounded-full flex items-center justify-center font-bold mr-4">
              7
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-[#1a1a1a] mb-3">
                Trečiųjų šalių paslaugos
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Mes galime naudoti trečiųjų šalių paslaugas (pvz., „Google Analytics"), kad gautume įžvalgas 
                apie svetainės lankytojų elgseną. Tokios trečiosios šalys gali rinkti informaciją pagal savo 
                privatumo politiką.
              </p>
            </div>
          </div>
        </section>

        {/* Section 8 */}
        <section className="mb-12">
          <div className="flex items-start mb-4">
            <div className="flex-shrink-0 w-10 h-10 bg-[#15803d] text-white rounded-full flex items-center justify-center font-bold mr-4">
              8
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-[#1a1a1a] mb-3">
                Jūsų teisės
              </h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                Jūs turite teisę:
              </p>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <span className="text-[#15803d] mr-2 font-bold">•</span>
                  <span className="text-gray-700">Prašyti prieigos prie savo asmens duomenų;</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#15803d] mr-2 font-bold">•</span>
                  <span className="text-gray-700">Reikalauti ištaisyti ar ištrinti savo duomenis;</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#15803d] mr-2 font-bold">•</span>
                  <span className="text-gray-700">Prieštarauti duomenų tvarkymui;</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#15803d] mr-2 font-bold">•</span>
                  <span className="text-gray-700">Apriboti duomenų tvarkymą tam tikromis aplinkybėmis;</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#15803d] mr-2 font-bold">•</span>
                  <span className="text-gray-700">Atšaukti duotą sutikimą, jei duomenys tvarkomi sutikimo pagrindu.</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Section 9 */}
        <section className="mb-12">
          <div className="flex items-start mb-4">
            <div className="flex-shrink-0 w-10 h-10 bg-[#15803d] text-white rounded-full flex items-center justify-center font-bold mr-4">
              9
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-[#1a1a1a] mb-3">
                Privatumo politikos pakeitimai
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Mes galime atnaujinti šią privatumo politiką, todėl rekomenduojame periodiškai ją peržiūrėti. 
                Pakeitimai įsigalioja nuo jų paskelbimo svetainėje.
              </p>
            </div>
          </div>
        </section>

        {/* Section 10 - Contact */}
        <section className="mb-12">
          <div className="flex items-start mb-4">
            <div className="flex-shrink-0 w-10 h-10 bg-[#15803d] text-white rounded-full flex items-center justify-center font-bold mr-4">
              10
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-[#1a1a1a] mb-3 flex items-center">
                <Mail size={24} className="mr-2" />
                Kontaktinė informacija
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Jei turite klausimų apie šią privatumo politiką, galite susisiekti su mumis:
              </p>
              
              <div className="bg-gradient-to-r from-[#15803d] to-[#16a34a] text-white p-6 rounded-xl shadow-lg">
                <p className="mb-2">
                  <strong>El. paštas:</strong>{' '}
                  <a href="mailto:pagalba@freshera.lt" className="underline hover:text-green-100">
                    pagalba@freshera.lt
                  </a>
                </p>
                <p className="mb-1"><strong>MB Lumiana LT</strong></p>
                <p>Tvenkiniu g 26, Mažeikiai</p>
              </div>
            </div>
          </div>
        </section>

        {/* Last Updated */}
        <div className="text-center text-sm text-gray-500 border-t pt-8">
          <p>Paskutinį kartą atnaujinta: 2025 m. lapkričio mėn.</p>
        </div>

      </div>
    </div>
  );
};

export default PrivacyPolicy;