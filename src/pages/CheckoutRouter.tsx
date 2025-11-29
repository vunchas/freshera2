import React, { useEffect, useState } from 'react';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import { Loader } from 'lucide-react';

/**
 * Checkout Router - Intelligently routes to appropriate checkout based on cart contents
 * 
 * Routes:
 * 1. Full Checkout (Device + Flavors) - /checkout/full
 *    - For: Pradžios Rinkinys, Transformacijos Rinkinys, or cart with device
 * 
 * 2. Filters Only Checkout - /checkout/filters
 *    - For: Only flavor filters (no device)
 * 
 * 3. Couple's Kit Checkout - /checkout/couple
 *    - For: Kartu Rinkinys (2 devices selection)
 */

const CheckoutRouter: React.FC = () => {
  const { items } = useCart();
  const navigate = useNavigate();
  const [analyzing, setAnalyzing] = useState(true);

  useEffect(() => {
    analyzeCartAndRoute();
  }, [items]);

  const analyzeCartAndRoute = () => {
    if (!items || items.length === 0) {
      // Empty cart - redirect to shop
      navigate('/', { replace: true });
      return;
    }

    // Check for Kartu Rinkinys (Couple's Kit)
    const hasCouplesKit = items.some(item => 
      item.name.toLowerCase().includes('kartu rinkinys') ||
      item.name.toLowerCase().includes('couple') ||
      item.id.includes('kartu')
    );

    if (hasCouplesKit) {
      console.log('Cart contains Kartu Rinkinys - routing to couple checkout');
      navigate('/checkout/couple', { replace: true });
      return;
    }

    // Check for device or starter kits
    const hasDevice = items.some(item => 
      item.categories?.some((c: any) => c.slug === 'irenginiai') ||
      item.name.toLowerCase().includes('įrenginys') ||
      item.name.toLowerCase().includes('device')
    );

    const hasStarterKit = items.some(item =>
      item.name.toLowerCase().includes('pradžios rinkinys') ||
      item.name.toLowerCase().includes('transformacijos rinkinys') ||
      item.name.toLowerCase().includes('starter kit') ||
      item.categories?.some((c: any) => c.slug === 'rinkiniai')
    );

    // Check for filters only
    const hasOnlyFilters = items.every(item =>
      item.categories?.some((c: any) => c.slug === 'filtrai') ||
      item.name.toLowerCase().includes('filtrai') ||
      item.name.toLowerCase().includes('filter')
    );

    if (hasOnlyFilters && !hasDevice && !hasStarterKit) {
      console.log('Cart contains only filters - routing to filters checkout');
      navigate('/checkout/filters', { replace: true });
      return;
    }

    // Default: Full checkout (device + flavors)
    console.log('Cart requires device selection - routing to full checkout');
    navigate('/checkout/full', { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#f0fdf4] flex items-center justify-center">
      <div className="text-center">
        <Loader className="animate-spin mx-auto mb-4" size={48} />
        <h2 className="text-xl font-bold text-[#1a1a1a] mb-2">Ruošiamas užsakymas...</h2>
        <p className="text-gray-600">Palaukite akimirką</p>
      </div>
    </div>
  );
};

export default CheckoutRouter;