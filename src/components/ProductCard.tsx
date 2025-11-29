import React, { useState } from 'react';
import { Product } from '../types';
import Button from './Button';
import { useCart } from '../context/CartContext';
import { Check, Star, ChevronDown } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  featured?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, featured = false }) => {
  const { addToCart } = useCart();
  const [selectedVariant, setSelectedVariant] = useState<string>(
    product.variants ? product.variants[0] : ''
  );
  const [selectedColor, setSelectedColor] = useState<string>(
    product.colors ? product.colors[2].name : '' // Default to Dark/Dark (last item usually)
  );

  const handleAddToCart = () => {
    addToCart(
      product, 
      product.variants ? selectedVariant : undefined,
      product.colors ? selectedColor : undefined
    );
  };

  // Helper to render the dot bar
  const AttributeBar = ({ level, label }: { level: number; label: string }) => (
    <div className="flex items-center justify-between mb-1">
      <span className="text-xs text-gray-500 uppercase tracking-wide font-semibold">{label}</span>
      <div className="flex gap-1">
        {[1, 2, 3].map((dot) => (
          <div
            key={dot}
            className={`w-2 h-2 rounded-full ${
              dot <= level ? 'bg-[#465f42]' : 'bg-[#d2d2a0]'
            }`}
          ></div>
        ))}
      </div>
    </div>
  );

  return (
    <div className={`bg-white rounded-2xl overflow-hidden border transition-all duration-500 flex flex-col h-full group relative ${featured ? 'transform lg:-translate-y-8 z-20 shadow-[0_20px_60px_-15px_rgba(74,222,128,0.3)] border-neon/60 ring-4 ring-neon/10' : 'border-gray-100 hover:shadow-xl hover:border-gray-200'}`}>
      
      {featured && (
        <div className="absolute top-0 inset-x-0 bg-gradient-to-r from-forestDark via-forestGreen to-forestDark text-white text-center text-xs font-bold uppercase tracking-widest py-3 z-30 shadow-md flex items-center justify-center gap-2">
          <Star size={14} className="text-neon fill-neon" />
          Geriausias Būdas Mesti
          <Star size={14} className="text-neon fill-neon" />
        </div>
      )}
      
      <div className={`relative overflow-hidden bg-gray-100 ${featured ? 'h-72 mt-8' : 'h-64'}`}>
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors z-10"></div>
        <img 
          src={product.image} 
          alt={product.name} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        {/* Image Overlay Text */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20 flex items-end justify-center">
           <span className="text-white text-sm font-medium">Pakeisk įprotį šiandien</span>
        </div>
      </div>

      <div className="p-8 flex flex-col flex-grow relative">
        {/* Category Tag */}
        <div className="mb-2">
             <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded ${featured ? 'bg-neon/20 text-forestDark' : 'bg-gray-100 text-gray-500'}`}>
                 {product.category === 'kit' ? 'Pilnas Rinkinys' : 'Papildymas'}
             </span>
        </div>

        <h3 className="text-2xl font-serif font-bold text-darkCharcoal mb-1">{product.name}</h3>
        
        <div className="flex items-baseline gap-2 mb-4">
             <p className="text-forestGreen text-2xl font-bold">{product.price.toFixed(2)} €</p>
             {product.category === 'kit' && (
                <span className="text-xs text-gray-400 line-through">{(product.price * 1.3).toFixed(2)} €</span>
             )}
        </div>
        
        {/* Flavor Attributes Section */}
        {product.attributes && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-100">
            <AttributeBar level={product.attributes.throatHit} label="Gerklės Kirtis" />
            <AttributeBar level={product.attributes.sweetness} label="Saldumas" />
          </div>
        )}

        <p className="text-gray-600 text-sm mb-6 leading-relaxed flex-grow border-t border-gray-100 pt-4">
          {product.description}
        </p>

        {product.features && product.features.length > 0 && (
          <ul className="space-y-3 mb-8">
            {product.features.map((feature, idx) => (
              <li key={idx} className="flex items-start gap-3 text-sm text-darkCharcoal font-medium">
                <div className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${featured ? 'bg-neon text-forestDark' : 'bg-gray-100 text-gray-500'}`}>
                    <Check size={12} strokeWidth={3} />
                </div>
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        )}

        {/* Device Color Selection */}
        {product.colors && (
          <div className="mb-4">
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Pasirinkite Spalvą:</label>
            <div className="flex gap-3">
              {product.colors.map((color) => (
                <button
                  key={color.name}
                  onClick={() => setSelectedColor(color.name)}
                  className={`relative group rounded-full p-0.5 transition-all ${selectedColor === color.name ? 'ring-2 ring-offset-1 ring-forestGreen scale-110' : 'hover:scale-105 ring-1 ring-gray-200'}`}
                  title={color.name}
                >
                  <div className="w-8 h-8 rounded-full overflow-hidden flex transform rotate-45">
                    <div className="w-1/2 h-full" style={{ backgroundColor: color.metalColor }}></div>
                    <div className="w-1/2 h-full" style={{ backgroundColor: color.woodColor }}></div>
                  </div>
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2 font-medium min-h-[1.5em]">
              {selectedColor}
            </p>
          </div>
        )}

        {/* Variant Selector for Kits (Flavors) */}
        {product.variants && (
          <div className="mb-4">
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Pasirinkite Skonį:</label>
            <div className="relative">
              <select 
                value={selectedVariant}
                onChange={(e) => setSelectedVariant(e.target.value)}
                className="w-full appearance-none bg-gray-50 border border-gray-200 text-darkCharcoal text-sm rounded-lg px-4 py-3 focus:ring-2 focus:ring-softGreen focus:border-transparent cursor-pointer"
              >
                {product.variants.map(v => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
            </div>
          </div>
        )}

        <Button 
            onClick={handleAddToCart} 
            fullWidth 
            variant={featured ? 'primary' : 'outline'}
            className={`mt-auto py-4 text-sm uppercase tracking-wider ${!featured ? 'hover:bg-forestGreen hover:text-white hover:border-forestGreen' : 'shadow-lg hover:shadow-xl'}`}
        >
          {featured ? 'Pradėti Pokyčius' : 'Į krepšelį'}
        </Button>

        {featured && (
            <p className="text-[10px] text-center text-gray-400 mt-3 font-medium">
                Nemokamas pristatymas nuo 40 €
            </p>
        )}
      </div>
    </div>
  );
};

export default ProductCard;