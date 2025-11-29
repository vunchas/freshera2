import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { Check, Info, ArrowLeft, Loader, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import {
  createOrder,
  createSubscription,
  validateBillingInfo,
  formatPrice,
  type OrderData,
} from '../services/woocommerce';

interface ShippingMethod {
  id: string;
  title: string;
  cost: number;
  description?: string;
}

interface PaymentMethod {
  id: string;
  name: string;
  logo: string;
  type: 'card' | 'bank';
}

/**
 * Filters Only Checkout - Simplified checkout for customers buying only flavor filters
 * No device selection required
 */
const CheckoutFilters: React.FC = () => {
  const { items, clearCart, cartTotal } = useCart();
  const navigate = useNavigate();
  
  // Drawer states (3 drawers instead of 5)
  const [openDrawer, setOpenDrawer] = useState<number>(1);
  const [completedDrawers, setCompletedDrawers] = useState<number[]>([]);
  
  // Selection states
  const [isSubscription, setIsSubscription] = useState(true);
  const [selectedShipping, setSelectedShipping] = useState<ShippingMethod | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [shippingMethods, setShippingMethods] = useState<ShippingMethod[]>([]);
  
  // Billing form state
  const [billingInfo, setBillingInfo] = useState<OrderData['billing']>({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    address_1: '',
    city: '',
    postcode: '',
    country: 'LT',
    company: '',
  });

  // Payment methods
  const paymentMethods: PaymentMethod[] = [
    { id: 'card', name: 'Banko kortelė', logo: 'https://cdn-icons-png.flaticon.com/512/3997/3997210.png', type: 'card' },
    { id: 'apple_pay', name: 'Apple Pay', logo: 'https://upload.wikimedia.org/wikipedia/commons/b/b0/Apple_Pay_logo.svg', type: 'card' },
    { id: 'google_pay', name: 'Google Pay', logo: 'https://upload.wikimedia.org/wikipedia/commons/f/f2/Google_Pay_Logo.svg', type: 'card' },
    { id: 'swedbank', name: 'Swedbank', logo: 'https://www.swedbank.lt/static/img/logo.svg', type: 'bank' },
    { id: 'seb', name: 'SEB', logo: 'https://www.seb.lt/themes/custom/seb/logo.svg', type: 'bank' },
    { id: 'luminor', name: 'Luminor', logo: 'https://www.luminor.lt/themes/custom/luminor/logo.svg', type: 'bank' },
  ];

  useEffect(() => {
    loadShippingMethods();
  }, []);

  const loadShippingMethods = async () => {
    try {
      const response = await fetch('/wp-json/wc/v3/shipping/zones');
      if (!response.ok) throw new Error('Failed to fetch shipping zones');
      
      const zones = await response.json();
      let allMethods: ShippingMethod[] = [];
      
      for (const zone of zones) {
        try {
          const methodsResponse = await fetch(`/wp-json/wc/v3/shipping/zones/${zone.id}/methods`);
          if (methodsResponse.ok) {
            const methods = await methodsResponse.json();
            methods.forEach((m: any) => {
              if (m.enabled) {
                allMethods.push({
                  id: m.instance_id?.toString() || m.id,
                  title: m.title || m.method_title,
                  cost: parseFloat(m.settings?.cost?.value || 0),
                  description: m.method_description || '',
                });
              }
            });
          }
        } catch (error) {
          console.error(`Error loading methods for zone ${zone.id}:`, error);
        }
      }
      
      if (allMethods.length > 0) {
        setShippingMethods(allMethods);
      } else {
        setShippingMethods([
          { id: 'flat_rate', title: 'Standartinis pristatymas', cost: 2.99, description: '2-3 darbo dienos' },
          { id: 'free_shipping', title: 'Nemokamas pristatymas', cost: 0, description: 'Užsakymams nuo €40' },
        ]);
      }
    } catch (error) {
      console.error('Error loading shipping methods:', error);
      setShippingMethods([
        { id: 'flat_rate', title: 'Standartinis pristatymas', cost: 2.99, description: '2-3 darbo dienos' },
        { id: 'free_shipping', title: 'Nemokamas pristatymas', cost: 0, description: 'Užsakymams nuo €40' },
      ]);
    }
  };

  // Calculate totals
  const shippingCost = selectedShipping?.cost || 0;
  const subtotal = cartTotal;
  const subscriptionDiscount = isSubscription ? subtotal * 0.30 : 0;
  const total = subtotal + shippingCost - subscriptionDiscount;

  const handleBillingChange = (field: keyof OrderData['billing'], value: string) => {
    setBillingInfo(prev => ({ ...prev, [field]: value }));
    setErrors([]);
  };

  const canProceedToNextDrawer = (drawerNum: number): boolean => {
    switch (drawerNum) {
      case 1: // Billing info
        return validateBillingInfo(billingInfo).length === 0;
      case 2: // Shipping
        return selectedShipping !== null;
      default:
        return false;
    }
  };

  const handleContinue = (fromDrawer: number) => {
    if (!canProceedToNextDrawer(fromDrawer)) {
      setErrors([getDrawerErrorMessage(fromDrawer)]);
      return;
    }
    
    setErrors([]);
    setCompletedDrawers([...completedDrawers, fromDrawer]);
    setOpenDrawer(fromDrawer + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getDrawerErrorMessage = (drawerNum: number): string => {
    switch (drawerNum) {
      case 1:
        return 'Prašome užpildyti visus privalomus laukus';
      case 2:
        return 'Prašome pasirinkti pristatymo būdą';
      default:
        return 'Prašome užpildyti šį žingsnį';
    }
  };

  const handleCheckout = async () => {
    setLoading(true);
    setErrors([]);

    try {
      if (!selectedShipping) {
        throw new Error('Nepasirinktas pristatymo būdas');
      }
      
      if (!selectedPayment) {
        throw new Error('Nepasirinktas mokėjimo būdas');
      }

      const validationErrors = validateBillingInfo(billingInfo);
      if (validationErrors.length > 0) {
        setErrors(validationErrors);
        setLoading(false);
        return;
      }

      // Prepare line items from cart
      const lineItems: any[] = items.map(item => ({
        product_id: parseInt(item.wcId || item.id.replace('wc-', '')),
        quantity: item.quantity,
        meta_data: [
          ...(item.selectedVariant ? [{ key: 'Skonis', value: item.selectedVariant }] : []),
        ],
      }));

      // Prepare order data
      const orderData: OrderData = {
        billing: billingInfo,
        line_items: lineItems,
        is_subscription: isSubscription,
        shipping_lines: [{
          method_id: selectedShipping.id,
          method_title: selectedShipping.title,
          total: selectedShipping.cost.toString(),
        }],
        payment_method: 'montonio',
        payment_method_title: selectedPayment.name,
        customer_note: `Mokėjimo būdas: ${selectedPayment.name}${isSubscription ? ' | Prenumerata' : ' | Tik filtrai'}`,
      };

      console.log('Creating filters-only order:', orderData);

      // Create order
      let response;
      if (isSubscription) {
        response = await createSubscription(orderData);
      } else {
        response = await createOrder(orderData);
      }

      if (response.success && response.payment_url) {
        clearCart();
        let paymentUrl = response.payment_url;
        if (selectedPayment.id !== 'card') {
          paymentUrl += `&preferred_provider=${selectedPayment.id}`;
        }
        window.location.href = paymentUrl;
      } else {
        throw new Error(response.message || 'Nepavyko sukurti užsakymo');
      }
    } catch (error: any) {
      console.error('Checkout error:', error);
      setErrors([error.message || 'Klaida apdorojant užsakymą. Bandykite dar kartą.']);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setLoading(false);
    }
  };

  const DrawerHeader = ({ num, title, isOpen, isCompleted, canOpen }: any) => (
    <button
      onClick={() => {
        if (canOpen && !isOpen) {
          setOpenDrawer(num);
        }
      }}
      disabled={!canOpen}
      className={`w-full flex items-center justify-between p-6 transition-all ${
        isOpen ? 'bg-white' : isCompleted ? 'bg-green-50' : 'bg-gray-50'
      } ${canOpen && !isOpen ? 'cursor-pointer hover:bg-gray-100' : ''} ${
        !canOpen ? 'opacity-50 cursor-not-allowed' : ''
      }`}
    >
      <div className="flex items-center gap-4">
        <div className={`flex items-center justify-center w-10 h-10 rounded-full font-bold transition-all ${
          isCompleted ? 'bg-[#15803d] text-white' : isOpen ? 'bg-[#15803d] text-white' : 'bg-gray-300 text-gray-600'
        }`}>
          {isCompleted ? <Check size={20} /> : num}
        </div>
        <h2 className="text-xl font-bold text-[#1a1a1a]">{title}</h2>
      </div>
      <div className="flex items-center gap-3">
        {isCompleted && <Check className="text-[#15803d]" size={24} />}
        {isOpen ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
      </div>
    </button>
  );

  return (
    <div className="min-h-screen bg-[#f0fdf4] py-6 px-4">
      <div className="max-w-2xl mx-auto">
        
        <Link to="/" className="inline-flex items-center text-gray-600 hover:text-forestGreen mb-6 transition-colors">
          <ArrowLeft size={20} className="mr-2" />
          Grįžti į parduotuvę
        </Link>

        {/* Info Banner */}
        <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <Info className="text-blue-500 flex-shrink-0 mt-0.5" size={20} />
            <div>
              <h4 className="font-bold text-blue-800 mb-1">Filtrų užsakymas</h4>
              <p className="text-sm text-blue-700">
                Užsakote tik skonių filtrus. Jeigu reikia įrenginio, grįžkite į parduotuvę.
              </p>
            </div>
          </div>
        </div>

        {/* Error Messages */}
        {errors.length > 0 && (
          <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
              <div>
                <h4 className="font-bold text-red-800 mb-2">Klaida:</h4>
                <ul className="text-sm text-red-700 space-y-1">
                  {errors.map((error, idx) => (
                    <li key={idx}>• {error}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* DRAWER 1: Billing Information */}
        <div className="bg-white rounded-2xl shadow-sm mb-4 border-2 border-gray-200 overflow-hidden">
          <DrawerHeader 
            num={1} 
            title="Pristatymo Informacija" 
            isOpen={openDrawer === 1}
            isCompleted={completedDrawers.includes(1)}
            canOpen={true}
          />
          
          {openDrawer === 1 && (
            <div className="p-6 border-t border-gray-200">
              <div className="space-y-4 mb-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Vardas *</label>
                    <input
                      type="text"
                      value={billingInfo.first_name}
                      onChange={(e) => handleBillingChange('first_name', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#15803d] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Pavardė *</label>
                    <input
                      type="text"
                      value={billingInfo.last_name}
                      onChange={(e) => handleBillingChange('last_name', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#15803d] focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">El. paštas *</label>
                  <input
                    type="email"
                    value={billingInfo.email}
                    onChange={(e) => handleBillingChange('email', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#15803d] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Telefonas *</label>
                  <input
                    type="tel"
                    value={billingInfo.phone}
                    onChange={(e) => handleBillingChange('phone', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#15803d] focus:border-transparent"
                    placeholder="+370..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Adresas *</label>
                  <input
                    type="text"
                    value={billingInfo.address_1}
                    onChange={(e) => handleBillingChange('address_1', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#15803d] focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Miestas *</label>
                    <input
                      type="text"
                      value={billingInfo.city}
                      onChange={(e) => handleBillingChange('city', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#15803d] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Pašto kodas *</label>
                    <input
                      type="text"
                      value={billingInfo.postcode}
                      onChange={(e) => handleBillingChange('postcode', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#15803d] focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Šalis *</label>
                  <select
                    value={billingInfo.country}
                    onChange={(e) => handleBillingChange('country', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#15803d] focus:border-transparent"
                  >
                    <option value="LT">Lietuva</option>
                    <option value="LV">Latvija</option>
                    <option value="EE">Estija</option>
                    <option value="PL">Lenkija</option>
                  </select>
                </div>
              </div>

              <button
                onClick={() => handleContinue(1)}
                className="w-full py-3 bg-[#15803d] text-white rounded-xl font-bold hover:bg-[#15803d]/90 transition-all"
              >
                Tęsti
              </button>
            </div>
          )}
        </div>

        {/* DRAWER 2: Shipping Selection */}
        <div className="bg-white rounded-2xl shadow-sm mb-4 border-2 border-gray-200 overflow-hidden">
          <DrawerHeader 
            num={2} 
            title="Pristatymo Būdas" 
            isOpen={openDrawer === 2}
            isCompleted={completedDrawers.includes(2)}
            canOpen={completedDrawers.includes(1)}
          />
          
          {openDrawer === 2 && (
            <div className="p-6 border-t border-gray-200">
              <div className="space-y-3 mb-6">
                {shippingMethods.map((method) => (
                  <button
                    key={method.id}
                    onClick={() => setSelectedShipping(method)}
                    className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                      selectedShipping?.id === method.id
                        ? 'border-[#15803d] bg-[#15803d]/10'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          selectedShipping?.id === method.id ? 'border-[#15803d] bg-[#15803d]' : 'border-gray-300'
                        }`}>
                          {selectedShipping?.id === method.id && <div className="w-2 h-2 bg-white rounded-full" />}
                        </div>
                        <span className="font-bold text-[#1a1a1a]">{method.title}</span>
                      </div>
                      <span className="font-bold text-[#15803d]">
                        {method.cost === 0 ? 'Nemokamas' : `${method.cost.toFixed(2)} €`}
                      </span>
                    </div>
                    {method.description && (
                      <p className="text-sm text-gray-600 ml-8">{method.description}</p>
                    )}
                  </button>
                ))}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setOpenDrawer(1);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-300 transition-all"
                >
                  Atgal
                </button>
                <button
                  onClick={() => handleContinue(2)}
                  disabled={!selectedShipping}
                  className={`flex-1 py-4 rounded-xl font-bold transition-all ${
                    selectedShipping
                      ? 'bg-[#15803d] text-white hover:bg-[#15803d]/90'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Tęsti
                </button>
              </div>
            </div>
          )}
        </div>

        {/* DRAWER 3: Payment & Confirmation */}
        <div className="bg-white rounded-2xl shadow-sm border-2 border-gray-200 overflow-hidden">
          <DrawerHeader 
            num={3} 
            title="Mokėjimas ir Patvirtinimas" 
            isOpen={openDrawer === 3}
            isCompleted={false}
            canOpen={completedDrawers.includes(2)}
          />
          
          {openDrawer === 3 && (
            <div className="p-6 border-t border-gray-200">
              
              {/* Subscription Toggle */}
              <div className="mb-6">
                <h3 className="font-bold text-[#1a1a1a] mb-3">Prenumerata</h3>
                <div className="space-y-3">
                  <div
                    onClick={() => setIsSubscription(true)}
                    className={`p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                      isSubscription
                        ? 'border-[#15803d] bg-gradient-to-br from-[#FFF9C4] to-[#FFF59D]'
                        : 'border-gray-200 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        isSubscription ? 'border-[#15803d] bg-[#15803d]' : 'border-gray-300'
                      }`}>
                        {isSubscription && <div className="w-2 h-2 bg-white rounded-full" />}
                      </div>
                      <div>
                        <h4 className="font-bold text-[#1a1a1a]">Prenumeruoti ir sutaupyti 30%</h4>
                        <p className="text-sm text-gray-600">Kas mėnesį</p>
                      </div>
                    </div>
                  </div>

                  <div
                    onClick={() => setIsSubscription(false)}
                    className={`p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                      !isSubscription
                        ? 'border-[#15803d] bg-[#15803d]/5'
                        : 'border-gray-200 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        !isSubscription ? 'border-[#15803d] bg-[#15803d]' : 'border-gray-300'
                      }`}>
                        {!isSubscription && <div className="w-2 h-2 bg-white rounded-full" />}
                      </div>
                      <h4 className="font-bold text-[#1a1a1a]">Vienkartinis pirkimas</h4>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Method Selection */}
              <div className="mb-6">
                <h3 className="font-bold text-[#1a1a1a] mb-3">Mokėjimo būdas</h3>
                <div className="grid grid-cols-3 gap-3">
                  {paymentMethods.map((method) => (
                    <button
                      key={method.id}
                      onClick={() => setSelectedPayment(method)}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        selectedPayment?.id === method.id
                          ? 'border-[#15803d] bg-[#15803d]/10'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-16 h-10 flex items-center justify-center">
                          <img 
                            src={method.logo} 
                            alt={method.name}
                            className="max-w-full max-h-full object-contain"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              e.currentTarget.parentElement!.innerHTML = `<span class="text-2xl">${method.type === 'card' ? '💳' : '🏦'}</span>`;
                            }}
                          />
                        </div>
                        <span className="text-xs font-medium text-[#1a1a1a] text-center">{method.name}</span>
                        {selectedPayment?.id === method.id && (
                          <Check className="text-[#15803d]" size={16} />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Order Summary */}
              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <h4 className="font-bold text-[#1a1a1a] mb-3">Užsakymo santrauka</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Filtrai ({items.length} vnt.):</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Pristatymas:</span>
                    <span>{shippingCost === 0 ? 'Nemokamas' : formatPrice(shippingCost)}</span>
                  </div>
                  {isSubscription && (
                    <div className="flex justify-between text-green-600">
                      <span>Prenumeratos nuolaida (30%):</span>
                      <span>-{formatPrice(subscriptionDiscount)}</span>
                    </div>
                  )}
                  <div className="border-t border-gray-300 pt-2 flex justify-between font-bold text-lg">
                    <span>Viso:</span>
                    <span className="text-[#15803d]">{formatPrice(total)}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 mb-4">
                <button
                  onClick={() => {
                    setOpenDrawer(2);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-300 transition-all"
                >
                  Atgal
                </button>
                <button 
                  onClick={handleCheckout}
                  disabled={loading || !selectedPayment}
                  className={`flex-1 py-5 rounded-xl font-bold text-lg shadow-lg flex items-center justify-center gap-2 transition-all ${
                    loading || !selectedPayment
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-[#15803d] text-white hover:bg-[#15803d]/90'
                  }`}
                >
                  {loading ? (
                    <>
                      <Loader className="animate-spin" size={20} />
                      VYKDOMA...
                    </>
                  ) : (
                    <>APMOKĖTI • {formatPrice(total)}</>
                  )}
                </button>
              </div>

              {/* Trust Badges */}
              <div className="flex items-center justify-center gap-6 text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <Check size={14} className="text-[#15803d]" />
                  <span>Saugus mokėjimas</span>
                </div>
                <div className="flex items-center gap-1">
                  <Check size={14} className="text-[#15803d]" />
                  <span>Montonio</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CheckoutFilters;