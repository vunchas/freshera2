import React from 'react';
import { FileText, ShoppingCart, Package, RotateCcw, Shield, Scale } from 'lucide-react';

const TermsAndConditions: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f0fdf4] to-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#15803d] to-[#16a34a] text-white py-16">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center justify-center mb-4">
            <FileText size={48} className="mr-3" />
            <h1 className="text-4xl font-bold">Sąlygos ir Taisyklės</h1>
          </div>
          <p className="text-center text-lg text-green-50 max-w-2xl mx-auto">
            Pirkimo ir pardavimo taisyklės elektroninėje parduotuvėje freshera.lt
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        
        {/* Section 1 - Bendrosios nuostatos */}
        <section className="mb-12">
          <div className="flex items-start mb-4">
            <div className="flex-shrink-0 w-10 h-10 bg-[#15803d] text-white rounded-full flex items-center justify-center font-bold mr-4">
              1
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-[#1a1a1a] mb-3 flex items-center">
                <Scale size={24} className="mr-2" />
                Bendrosios nuostatos
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Šios pirkimo ir pardavimo taisyklės (toliau – Taisyklės) nustato asmens, įsigyjančio prekes šioje elektroninėje 
                parduotuvėje (toliau – Pirkėjas), ir <strong>MB Lumiana LT</strong> (toliau – Pardavėjas) tarpusavio teises, 
                pareigas ir atsakomybę, Pirkėjui įsigyjant prekes elektroninėje parduotuvėje <strong>freshera.lt</strong>.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Įsigydamas prekes elektroninėje parduotuvėje, Pirkėjas sutinka su šių Taisyklių taikymu.
              </p>
            </div>
          </div>
        </section>

        {/* Section 2 - Sutarties sudarymas */}
        <section className="mb-12">
          <div className="flex items-start mb-4">
            <div className="flex-shrink-0 w-10 h-10 bg-[#15803d] text-white rounded-full flex items-center justify-center font-bold mr-4">
              2
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-[#1a1a1a] mb-3 flex items-center">
                <ShoppingCart size={24} className="mr-2" />
                Pirkimo ir pardavimo sutarties sudarymo momentas
              </h2>
              
              <div className="space-y-4">
                <div className="bg-white border-l-4 border-[#15803d] p-4 rounded-r-lg shadow-sm">
                  <h3 className="font-bold text-[#15803d] mb-2">2.1. Sutarties sudarymas</h3>
                  <p className="text-gray-700 leading-relaxed">
                    Pirkimo ir pardavimo sutartis tarp Pirkėjo ir Pardavėjo laikoma sudaryta nuo to momento, kai Pirkėjas 
                    elektroninėje parduotuvėje suformavęs prekių krepšelį, nurodęs pristatymo adresą, pasirinkęs apmokėjimo būdą 
                    ir paspaudžia mygtuką <strong>"Baigti užsakymą"</strong> arba <strong>"Patvirtinti ✔️"</strong>, ir galioja 
                    iki visiško pareigų pagal šią sutartį įvykdymo.
                  </p>
                  <p className="text-gray-700 leading-relaxed mt-2">
                    Tais atvejais, kai Pirkėjas nepritaria visoms arba tam tikrai daliai Taisyklių, jis privalo nepateikti užsakymo.
                  </p>
                </div>

                <div className="bg-white border-l-4 border-[#15803d] p-4 rounded-r-lg shadow-sm">
                  <h3 className="font-bold text-[#15803d] mb-2">2.2. Mokėjimo būdai</h3>
                  <p className="text-gray-700 leading-relaxed mb-3">
                    Atsiskaityti galima naudojantis:
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <span className="text-[#15803d] mr-2 font-bold">•</span>
                      <span className="text-gray-700">Visų Lietuvos bankų elektroninės bankininkystės paslaugomis</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-[#15803d] mr-2 font-bold">•</span>
                      <span className="text-gray-700">Apple Pay, Google Pay</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-[#15803d] mr-2 font-bold">•</span>
                      <span className="text-gray-700">Mastercard ir Visa kortelėmis</span>
                    </li>
                  </ul>
                  <p className="text-gray-700 leading-relaxed mt-3">
                    Atsiskaitymai galimi euro valiuta. Mokėjimai apdorojami naudojantis <strong>Montonio</strong> mokėjimų platforma.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3 - Pirkėjo teisės */}
        <section className="mb-12">
          <div className="flex items-start mb-4">
            <div className="flex-shrink-0 w-10 h-10 bg-[#15803d] text-white rounded-full flex items-center justify-center font-bold mr-4">
              3
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-[#1a1a1a] mb-3">
                Pirkėjo teisės
              </h2>

              <div className="space-y-4">
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-bold text-[#15803d] mb-2">3.1. Teisė pirkti prekes</h3>
                  <p className="text-gray-700">
                    Pirkėjas turi teisę pirkti prekes elektroninėje parduotuvėje, vadovaudamasis šiomis Taisyklėmis bei 
                    Lietuvos Respublikos teisės aktais.
                  </p>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-bold text-[#15803d] mb-2">3.2. Teisė atsisakyti sutarties</h3>
                  <p className="text-gray-700 mb-2">
                    Pirkėjas (vartotojas) turi teisę atsisakyti elektroninėje parduotuvėje sudarytos prekių pirkimo ir pardavimo 
                    sutarties su Pardavėju, apie tai raštu pranešdamas Pardavėjui <strong>per 14 darbo dienų</strong> nuo prekės 
                    pristatymo dienos.
                  </p>
                  <div className="bg-amber-50 border-l-4 border-amber-500 p-3 mt-3">
                    <p className="text-sm text-gray-700">
                      <strong>Išimtys:</strong> Netaikoma sutartims dėl garso ir vaizdo kūrinių ir fonogramų (jei pažeistos pakuotės 
                      apsaugos), kompiuterinių programų pardavimo, laikraščių, žurnalų ar kitų periodinių leidinių.
                    </p>
                  </div>
                  <p className="text-gray-700 mt-3">
                    Pirkėjas turi teisę atsisakyti sutarties tik tuo atveju, jei prekė yra kokybiška, nebuvo sugadinta ir iš esmės 
                    nepasikeitė jos išvaizda.
                  </p>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-bold text-[#15803d] mb-2">3.3. Kitos teisės</h3>
                  <p className="text-gray-700">
                    Pirkėjas turi kitas Taisyklėse ir Lietuvos Respublikos teisės aktuose numatytas teises.
                  </p>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-bold text-[#15803d] mb-2">3.4. Teisių pažeidimas</h3>
                  <p className="text-gray-700 mb-3">
                    Pirkėjas, manantis, kad buvo pažeistos jo teisės, turi <strong>ne vėliau kaip per tris mėnesius</strong> nuo 
                    pažeidimo dienos raštu kreiptis į Pardavėją ir išdėstyti savo reikalavimus. Pardavėjas privalo ne vėliau kaip 
                    per 14 dienų nemokamai išnagrinėti prašymą ir pateikti išsamų motyvuotą rašytinį atsakymą.
                  </p>
                  <p className="text-gray-700">
                    Jei problemos išspręsti nepavyksta, Pirkėjas turi teisę kreiptis į:
                  </p>
                  <ul className="mt-2 space-y-1">
                    <li className="flex items-start">
                      <span className="text-[#15803d] mr-2">→</span>
                      <span className="text-gray-700">Valstybinę vartotojų teisių apsaugos tarnybą (Vilniaus g. 25, LT-01402 Vilnius, 
                      <a href="https://www.vvtat.lt" target="_blank" rel="noopener noreferrer" className="text-[#15803d] hover:underline ml-1">
                        www.vvtat.lt
                      </a>)
                      </span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-[#15803d] mr-2">→</span>
                      <span className="text-gray-700">Teismą</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-bold text-[#15803d] mb-2">3.5. Elektroninė ginčų platforma</h3>
                  <p className="text-gray-700">
                    Prašymus ar skundus Pirkėjas gali pateikti elektroninio vartotojų ginčų sprendimo platformoje:{' '}
                    <a href="http://ec.europa.eu/odr/" target="_blank" rel="noopener noreferrer" className="text-[#15803d] hover:underline">
                      http://ec.europa.eu/odr/
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 4 - Pirkėjo pareigos */}
        <section className="mb-12">
          <div className="flex items-start mb-4">
            <div className="flex-shrink-0 w-10 h-10 bg-[#15803d] text-white rounded-full flex items-center justify-center font-bold mr-4">
              4
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-[#1a1a1a] mb-3">
                Pirkėjo pareigos
              </h2>

              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-bold text-[#15803d] mb-2">4.1. Apmokėjimas</h3>
                  <p className="text-gray-700">
                    Pirkėjas privalo sumokėti prekių bei jų pristatymo kainą, taip pat kitus mokėjimus (jei tokie nurodyti, 
                    sudarant sutartį) ir priimti užsakytas prekes. Už prekes Pirkėjas sumoka, pasirinkdamas vieną iš nurodytų 
                    mokėjimo būdų (elektroninė bankininkystė, Apple Pay, Google Pay, Mastercard, Visa kortelės).
                  </p>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-bold text-[#15803d] mb-2">4.2. Duomenų atnaujinimas</h3>
                  <p className="text-gray-700">
                    Jeigu pasikeičia Pirkėjo registracijos formoje pateikti duomenys, Pirkėjas privalo nedelsdamas juos atnaujinti.
                  </p>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-bold text-[#15803d] mb-2">4.3. Teisės aktų laikymasis</h3>
                  <p className="text-gray-700">
                    Pirkėjas privalo laikytis kitų Sąlygų ir Taisyklių bei Lietuvos Respublikos teisės aktuose nustatytų reikalavimų.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 5 - Pardavėjo teisės */}
        <section className="mb-12">
          <div className="flex items-start mb-4">
            <div className="flex-shrink-0 w-10 h-10 bg-[#15803d] text-white rounded-full flex items-center justify-center font-bold mr-4">
              5
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-[#1a1a1a] mb-3">
                Pardavėjo teisės
              </h2>

              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-bold text-[#15803d] mb-2">5.1. Prieigos apribojimas</h3>
                  <p className="text-gray-700">
                    Jei Pirkėjas bando pakenkti elektroninės parduotuvės darbui ar stabiliam veikimui ar pažeidžia savo 
                    įsipareigojimus, Pardavėjas gali be išankstinio perspėjimo apriboti, sustabdyti (nutraukti) jam galimybę 
                    naudotis elektronine parduotuve ir neatsako už jokius su tuo susijusius Pirkėjo nuostolius.
                  </p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-bold text-[#15803d] mb-2">5.2. Veiklos nutraukimas</h3>
                  <p className="text-gray-700">
                    Pardavėjas turi teisę laikinai arba neterminuotai nutraukti elektroninės parduotuvės veiklą be atskiro 
                    įspėjimo ir neatsako už jokius su tuo susijusius Pirkėjo nuostolius.
                  </p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-bold text-[#15803d] mb-2">5.3. Taisyklių keitimas</h3>
                  <p className="text-gray-700">
                    Pardavėjas turi teisę vienašališkai pakeisti šias Taisykles, paskelbdamas pakeistas Taisykles elektroninės 
                    parduotuvės tinklalapyje. Pakeitimai įsigalioja nuo paskelbimo momento visiems po paskelbimo sudaromiems sandoriams.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 6 - Pardavėjo pareigos */}
        <section className="mb-12">
          <div className="flex items-start mb-4">
            <div className="flex-shrink-0 w-10 h-10 bg-[#15803d] text-white rounded-full flex items-center justify-center font-bold mr-4">
              6
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-[#1a1a1a] mb-3 flex items-center">
                <Package size={24} className="mr-2" />
                Pardavėjo pareigos
              </h2>

              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-bold text-[#15803d] mb-2">6.1. Pristatymo terminai</h3>
                  <p className="text-gray-700">
                    Pardavėjas užtikrina, kad prekės būtų pristatomos Pirkėjui per numatytą laikotarpį, priklausomai nuo užsakytų 
                    prekių tipo ir pristatymo vietos. Prekės paprastai pristatomos <strong>per 1-5 darbo dienas</strong> nuo užsakymo 
                    patvirtinimo.
                  </p>
                  <p className="text-gray-700 mt-2">
                    Retkarčiais gali būti vėlavimų dėl padidėjusio užsakymų kiekio, pristatymo paslaugų teikėjų problemų ar kitų 
                    neplanuotų aplinkybių. Pardavėjas įsipareigoja informuoti Pirkėją apie bet kokius pristatymo vėlavimus.
                  </p>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-bold text-[#15803d] mb-2">6.2. Pristatymo būdai</h3>
                  <p className="text-gray-700">
                    Prekės pristatomos į Pirkėjo nurodytą paštomatą pagal užsakymą. Pardavėjas pasirūpina, kad prekių siuntimas 
                    būtų užtikrintas patikimais pristatymo būdais ir suteikia Pirkėjui informaciją apie siuntos sekimą.
                  </p>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-bold text-[#15803d] mb-2">6.3. Informavimas</h3>
                  <p className="text-gray-700">
                    Pardavėjas privalo informuoti Pirkėją apie bet kokius prekių pristatymo vėlavimus ir padėti išspręsti problemas, 
                    susijusias su pristatymu.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 7 - Prekių grąžinimas */}
        <section className="mb-12">
          <div className="flex items-start mb-4">
            <div className="flex-shrink-0 w-10 h-10 bg-[#15803d] text-white rounded-full flex items-center justify-center font-bold mr-4">
              7
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-[#1a1a1a] mb-3 flex items-center">
                <RotateCcw size={24} className="mr-2" />
                Prekių grąžinimas
              </h2>

              <div className="space-y-4">
                <div className="bg-amber-50 p-4 rounded-lg border-l-4 border-amber-500">
                  <h3 className="font-bold text-amber-800 mb-2">7.1. Grąžinimo terminas</h3>
                  <p className="text-gray-700">
                    Pirkėjas turi teisę grąžinti prekes <strong>per 14 dienų</strong> nuo prekių gavimo dienos, nenurodydamas 
                    priežasties, išskyrus tam tikrus atvejus, kai prekei taikomi grąžinimo apribojimai (pvz., pažeistos pakuotės, 
                    atidarytos, naudojamos prekės).
                  </p>
                </div>

                <div className="bg-amber-50 p-4 rounded-lg border-l-4 border-amber-500">
                  <h3 className="font-bold text-amber-800 mb-2">7.2. Prekės būklė</h3>
                  <p className="text-gray-700">
                    Prekės turi būti grąžintos originalioje pakuotėje, su visomis dalimis, nepažeistos ir nesugadintos. Jei prekė 
                    buvo sugadinta dėl netinkamo naudojimo, ji nebus priimta grąžinimui.
                  </p>
                </div>

                <div className="bg-amber-50 p-4 rounded-lg border-l-4 border-amber-500">
                  <h3 className="font-bold text-amber-800 mb-2">7.3. Grąžinimo išlaidos</h3>
                  <p className="text-gray-700">
                    Už grąžinimo išlaidas atsako Pirkėjas. Prekės, kurios buvo pažeistos dėl netinkamo naudojimo, nebus priimtos.
                  </p>
                </div>

                <div className="bg-amber-50 p-4 rounded-lg border-l-4 border-amber-500">
                  <h3 className="font-bold text-amber-800 mb-2">7.4. Grąžinimo procesas</h3>
                  <p className="text-gray-700">
                    Pirkėjas turi susisiekti su Pardavėju dėl grąžinimo ir pateikti vaizdo įrašą ar nuotraukas, kuriose matomi bet 
                    kokie prekių pažeidimai, jeigu tokie yra. Prekės turi būti grąžintos per 14 dienų nuo gavimo.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 8 - Atsakomybė */}
        <section className="mb-12">
          <div className="flex items-start mb-4">
            <div className="flex-shrink-0 w-10 h-10 bg-[#15803d] text-white rounded-full flex items-center justify-center font-bold mr-4">
              8
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-[#1a1a1a] mb-3 flex items-center">
                <Shield size={24} className="mr-2" />
                Atsakomybė
              </h2>

              <div className="space-y-4">
                <div className="bg-red-50 p-4 rounded-lg border-l-4 border-red-500">
                  <h3 className="font-bold text-red-800 mb-2">8.1. Pirkėjo atsakomybė</h3>
                  <p className="text-gray-700">
                    Pirkėjas atsako už registracijos formoje pateiktų duomenų teisingumą. Pirkėjas prisiima atsakomybę už padarinius, 
                    kilusius dėl registracijos formoje pateiktų duomenų klaidingumo ar netikslumo.
                  </p>
                </div>

                <div className="bg-red-50 p-4 rounded-lg border-l-4 border-red-500">
                  <h3 className="font-bold text-red-800 mb-2">8.2. Bendros nuostatos</h3>
                  <p className="text-gray-700">
                    Už pirkimo ir pardavimo sutarties, sudarytos naudojantis elektronine parduotuve, pažeidimą šalys atsako 
                    Lietuvos Respublikos teisės aktų nustatyta tvarka.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="mb-12">
          <div className="bg-gradient-to-r from-[#15803d] to-[#16a34a] text-white p-6 rounded-xl shadow-lg">
            <h2 className="text-2xl font-bold mb-4">Kontaktinė informacija</h2>
            <p className="mb-2">
              <strong>El. paštas:</strong>{' '}
              <a href="mailto:pagalba@freshera.lt" className="underline hover:text-green-100">
                pagalba@freshera.lt
              </a>
            </p>
            <p className="mb-1"><strong>MB Lumiana LT</strong></p>
            <p>Tvenkiniu g 26, Mažeikiai</p>
          </div>
        </section>

        {/* Last Updated */}
        <div className="text-center text-sm text-gray-500 border-t pt-8">
          <p>Paskutinį kartą atnaujinta: 2025 m. lapkričio mėn.</p>
          <p className="mt-2">Šios taisyklės galioja nuo paskelbimo dienos</p>
        </div>

      </div>
    </div>
  );
};

export default TermsAndConditions;