import React from 'react';
import { Mail, Phone, MapPin, Clock, MessageCircle } from 'lucide-react';

const Contact: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f0fdf4] to-white">
      
      {/* Hero Section */}
      <section className="py-20 px-4 bg-[#15803d] text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-6">Kontaktai</h1>
          <p className="text-xl text-white/90">
            Turite klausimų? Mielai jums padėsime!
          </p>
        </div>
      </section>

      {/* Contact Information */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            
            {/* Contact Cards */}
            <div className="space-y-6">
              {/* Email */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-[#15803d] rounded-full flex items-center justify-center">
                      <Mail className="text-white" size={24} />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-[#1a1a1a] mb-2">El. Paštas</h3>
                    <a 
                      href="mailto:pagalba@freshera.lt" 
                      className="text-[#15803d] hover:underline text-lg font-medium"
                    >
                      pagalba@freshera.lt
                    </a>
                    <p className="text-sm text-gray-600 mt-2">
                      Atsakome per 24 valandas
                    </p>
                  </div>
                </div>
              </div>

              {/* Phone (if available) */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-[#15803d] rounded-full flex items-center justify-center">
                      <Phone className="text-white" size={24} />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-[#1a1a1a] mb-2">Telefonas</h3>
                    <a 
                      href="tel:+37060000000" 
                      className="text-[#15803d] hover:underline text-lg font-medium"
                    >
                      +370 600 00000
                    </a>
                    <p className="text-sm text-gray-600 mt-2">
                      Darbo dienomis 9:00 - 18:00
                    </p>
                  </div>
                </div>
              </div>

              {/* Working Hours */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-[#15803d] rounded-full flex items-center justify-center">
                      <Clock className="text-white" size={24} />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-[#1a1a1a] mb-3">Darbo Laikas</h3>
                    <div className="space-y-2 text-gray-700">
                      <div className="flex justify-between">
                        <span>Pirmadienis - Penktadienis:</span>
                        <span className="font-medium">9:00 - 18:00</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Šeštadienis:</span>
                        <span className="font-medium">10:00 - 15:00</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Sekmadienis:</span>
                        <span className="font-medium text-red-600">Uždaryta</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Location */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-[#15803d] rounded-full flex items-center justify-center">
                      <MapPin className="text-white" size={24} />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-[#1a1a1a] mb-2">Adresas</h3>
                    <p className="text-gray-700">
                      Vilnius, Lietuva<br />
                      <span className="text-sm text-gray-500">Tikslus adresas bus pateiktas susisiekus</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="flex items-center gap-3 mb-6">
                <MessageCircle className="text-[#15803d]" size={32} />
                <h2 className="text-2xl font-bold text-[#1a1a1a]">Parašykite Mums</h2>
              </div>

              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Vardas *
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#15803d] focus:border-transparent"
                    placeholder="Jūsų vardas"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    El. paštas *
                  </label>
                  <input
                    type="email"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#15803d] focus:border-transparent"
                    placeholder="jusu@email.lt"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Telefonas
                  </label>
                  <input
                    type="tel"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#15803d] focus:border-transparent"
                    placeholder="+370..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tema *
                  </label>
                  <select
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#15803d] focus:border-transparent"
                  >
                    <option value="">Pasirinkite temą</option>
                    <option value="order">Klausimas apie užsakymą</option>
                    <option value="product">Klausimas apie produktą</option>
                    <option value="technical">Techninė problema</option>
                    <option value="suggestion">Pasiūlymas</option>
                    <option value="other">Kita</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Žinutė *
                  </label>
                  <textarea
                    required
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#15803d] focus:border-transparent"
                    placeholder="Parašykite savo žinutę..."
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#15803d] text-white py-4 rounded-xl font-bold text-lg hover:bg-[#15803d]/90 transition-all shadow-lg"
                >
                  Siųsti Žinutę
                </button>

                <p className="text-xs text-gray-500 text-center">
                  * Privalomi laukai
                </p>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-[#1a1a1a] mb-12">
            Dažniausiai Užduodami Klausimai
          </h2>
          <div className="space-y-4">
            <details className="bg-white rounded-xl shadow-lg p-6">
              <summary className="font-bold text-lg text-[#1a1a1a] cursor-pointer">
                Kaip greitai gauiu užsakymą?
              </summary>
              <p className="mt-4 text-gray-700">
                Standartinis pristatymas Lietuvoje užtrunka 2-3 darbo dienas. 
                Gavę užsakymą, mes jį išsiunčiame per 24 valandas.
              </p>
            </details>

            <details className="bg-white rounded-xl shadow-lg p-6">
              <summary className="font-bold text-lg text-[#1a1a1a] cursor-pointer">
                Ar galiu grąžinti produktą?
              </summary>
              <p className="mt-4 text-gray-700">
                Taip! Turite 14 dienų grąžinti nepanaudotą produktą. 
                Susisiekite su mumis el. paštu pagalba@freshera.lt.
              </p>
            </details>

            <details className="bg-white rounded-xl shadow-lg p-6">
              <summary className="font-bold text-lg text-[#1a1a1a] cursor-pointer">
                Ar produktas tinka visiems?
              </summary>
              <p className="mt-4 text-gray-700">
                Mūsų produktas skirtas suaugusiems (18+) rūkaliams, norintiems 
                mesti ar sumažinti rūkymą. Nėščioms ar maitinančioms moterims 
                rekomenduojame pasikonsultuoti su gydytoju.
              </p>
            </details>

            <details className="bg-white rounded-xl shadow-lg p-6">
              <summary className="font-bold text-lg text-[#1a1a1a] cursor-pointer">
                Kaip veikia prenumerata?
              </summary>
              <p className="mt-4 text-gray-700">
                Su prenumerata gaunate 30% nuolaidą ir automatinius kas mėnesį 
                siuntimus. Galite atšaukti bet kada be papildomų mokesčių.
              </p>
            </details>
          </div>
        </div>
      </section>

      {/* Emergency Contact */}
      <section className="py-12 px-4 bg-[#15803d] text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-2xl font-bold mb-4">Skubūs Klausimai?</h3>
          <p className="text-white/90 mb-6">
            Susisiekite su mumis tiesiogiai el. paštu
          </p>
          <a 
            href="mailto:pagalba@freshera.lt"
            className="inline-block bg-white text-[#15803d] px-8 py-3 rounded-xl font-bold hover:bg-gray-100 transition-all"
          >
            pagalba@freshera.lt
          </a>
        </div>
      </section>

    </div>
  );
};

export default Contact;