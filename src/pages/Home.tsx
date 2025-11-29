import React, { useState, useEffect } from 'react';
import Hero from '../components/Hero';
import FeaturesGrid from '../components/FeaturesGrid';
import ProductCard from '../components/ProductCard';
import FAQ from '../components/FAQ';
import { PRODUCTS } from '../constants';
import { fetchWCProducts, transformWCProduct } from '../services/woocommerce';
import { Product } from '../types';

const Home: React.FC = () => {
  const [products, setProducts] = useState<Product[]>(PRODUCTS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        // Try to fetch from WooCommerce
        const wcProducts = await fetchWCProducts();
        
        if (wcProducts && wcProducts.length > 0) {
          // Use WooCommerce products if available
          const transformedProducts = wcProducts.map(transformWCProduct);
          setProducts(transformedProducts);
        }
        // Otherwise fallback to constants (already set in state)
      } catch (error) {
        console.error('Error loading products, using fallback:', error);
        // Fallback to constants (already set)
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  const kits = products.filter(p => 
  p.category === 'kit' && 
  !p.name?.includes('Skonių Rinkinys') && 
  !p.name?.includes('Kolekcija') &&
  !(p.categories && p.categories.some((cat: any) => cat.slug === 'srinkiniai'))
);
  // Get bundles (rinkiniai category) instead of individual filters
 const bundles = products.filter(p => 
  p.name?.includes('Skonių Rinkinys') || 
  p.name?.includes('Kolekcija') ||
  (p.categories && p.categories.some((cat: any) => cat.slug === 'srinkiniai'))
);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-warmWhite">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-forestGreen border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Kraunami produktai...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="bg-warmWhite">
      <Hero />
      
      <section id="products" className="py-24 bg-gradient-to-b from-forestDark to-forestGreen/90 text-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-serif font-bold text-white mb-4">Pasirinkite Savo Rinkinį</h2>
            <p className="text-gray-200 max-w-2xl mx-auto">Pradėkite kelionę be dūmų su mūsų kruopščiai atrinktais ąžuolo rinkiniais.</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 lg:gap-16 max-w-5xl mx-auto">
            {kits.map((kit) => (
              <ProductCard 
                key={kit.id} 
                product={kit} 
                featured={kit.id.includes('transformation')} 
              />
            ))}
          </div>
        </div>
        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-[0]">
            <svg data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none" className="relative block h-16 w-full fill-warmWhite">
                <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"></path>
            </svg>
        </div>
      </section>

      <FeaturesGrid />

      {/* CHANGED: This section now shows bundles instead of individual filters */}
      <section id="bundles" className="py-24 bg-[#f0fdf4]">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
            <div>
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-forestDark mb-2">Skonių Rinkiniai</h2>
              <div className="h-1 w-20 bg-softGreen rounded-full"></div>
            </div>
            <p className="text-gray-600 italic">Pasirinkite savo idealų skonių rinkinį.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
             {bundles.map((bundle) => (
              <ProductCard key={bundle.id} product={bundle} />
            ))}
          </div>
         </div>
      </section>

      <FAQ />
    </main>
  );
};

export default Home;
