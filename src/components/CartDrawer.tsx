import React from 'react';
import { useCart } from '../context/CartContext';
import { X, Trash2, Minus, Plus } from 'lucide-react';
import Button from './Button';
import { useNavigate } from 'react-router-dom';

const CartDrawer: React.FC = () => {
  const { 
    isCartOpen, 
    setIsCartOpen, 
    items, 
    removeFromCart, 
    updateQuantity, 
    cartTotal 
  } = useCart();
  const navigate = useNavigate();

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex justify-end">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity" 
        onClick={() => setIsCartOpen(false)}
      />

      {/* Drawer */}
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-fade-in-up">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-warmWhite">
          <h2 className="text-2xl font-serif font-bold text-darkCharcoal">Jūsų Krepšelis</h2>
          <button onClick={() => setIsCartOpen(false)} className="text-gray-400 hover:text-darkCharcoal">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {items.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">Krepšelis tuščias.</p>
              <Button variant="secondary" onClick={() => setIsCartOpen(false)}>Tęsti apsipirkimą</Button>
            </div>
          ) : (
            items.map(item => (
              <div key={`${item.id}-${item.selectedVariant}-${item.selectedColor}`} className="flex gap-4 border-b border-gray-50 pb-4">
                <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded-lg bg-gray-100" />
                <div className="flex-1">
                  <div className="flex justify-between mb-1">
                    <div>
                        <h3 className="font-medium text-darkCharcoal">{item.name}</h3>
                        <div className="flex flex-col mt-0.5">
                          {item.selectedVariant && (
                              <span className="text-xs text-gray-500 font-medium">Skonis: {item.selectedVariant}</span>
                          )}
                          {item.selectedColor && (
                              <span className="text-xs text-gray-500 font-medium">Spalva: {item.selectedColor}</span>
                          )}
                        </div>
                    </div>
                    <button onClick={() => removeFromCart(item.id, item.selectedVariant, item.selectedColor)} className="text-gray-400 hover:text-red-500 self-start">
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <p className="text-softGreen font-bold mb-2">{item.price.toFixed(2)} €</p>
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => updateQuantity(item.id, -1, item.selectedVariant, item.selectedColor)}
                      className="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                    >
                      <Minus size={12} />
                    </button>
                    <span className="text-sm font-medium w-4 text-center">{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.id, 1, item.selectedVariant, item.selectedColor)}
                      className="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                    >
                      <Plus size={12} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className="p-6 border-t border-gray-100 bg-warmWhite">
            <div className="flex justify-between items-center mb-4">
              <span className="text-gray-600">Viso:</span>
              <span className="text-2xl font-serif font-bold text-forestGreen">{cartTotal.toFixed(2)} €</span>
            </div>
            <Button 
              fullWidth 
              onClick={() => {
                setIsCartOpen(false);
                navigate('/checkout');
              }}
            >
              Apmokėti
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartDrawer;