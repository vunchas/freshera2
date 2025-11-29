import React, { createContext, useContext, useState, ReactNode } from 'react';
import { CartItem, Product } from '../types';

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, variant?: string, color?: string) => void;
  removeFromCart: (productId: string, variant?: string, color?: string) => void;
  updateQuantity: (productId: string, delta: number, variant?: string, color?: string) => void;
  clearCart: () => void;
  cartTotal: number;
  cartCount: number;
  isCartOpen: boolean;
  setIsCartOpen: (isOpen: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const addToCart = (product: Product, variant?: string, color?: string) => {
    setItems(prev => {
      const existing = prev.find(item => 
        item.id === product.id && 
        item.selectedVariant === variant && 
        item.selectedColor === color
      );
      
      if (existing) {
        return prev.map(item =>
          (item.id === product.id && item.selectedVariant === variant && item.selectedColor === color) 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      }
      return [...prev, { ...product, quantity: 1, selectedVariant: variant, selectedColor: color }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (productId: string, variant?: string, color?: string) => {
    setItems(prev => prev.filter(item => !(item.id === productId && item.selectedVariant === variant && item.selectedColor === color)));
  };

  const updateQuantity = (productId: string, delta: number, variant?: string, color?: string) => {
    setItems(prev => prev.map(item => {
      if (item.id === productId && item.selectedVariant === variant && item.selectedColor === color) {
        const newQuantity = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQuantity };
      }
      return item;
    }));
  };

  const clearCart = () => setItems([]);

  const cartTotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider value={{
      items,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      cartTotal,
      cartCount,
      isCartOpen,
      setIsCartOpen
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};