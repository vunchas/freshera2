import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { fetchWCProducts, transformWCProduct, DEVICE_COLORS } from '../services/woocommerce';
import { ChevronDown, ChevronUp, Check, Users } from 'lucide-react';

// Types
interface BillingData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
}

interface ShippingMethod {
  id: string;
  title: string;
  cost: number;
  description: string;
}

interface PaymentMethod {
  id: string;
  title: string;
  logo?: string;
  emoji?: string;
}

const CheckoutCouple: React.FC = () => {
  const navigate = useNavigate();
  const { items, clearCart } = useCart();
  
  // Drawer states (5 drawers: 2 Devices + Flavors + Billing + Shipping + Payment)
  const [openDrawer, setOpenDrawer] = useState<number>(1);
  const [completedDrawers, setCompletedDrawers] = useState<number[]>([]);
  
  // Device selections - need 2!
  const [device1, setDevice1] = useState<any>(null);
  const [device2, setDevice2] = useState<any>(null);
  
  // Flavor selection
  const [packSize, setPackSize] = useState<'3-pack' | '6-pack' | 'complete-pack'>('6-pack');
  const [selectedPacks, setSelectedPacks] = useState<any[]>([]);
  
  // Form data
  const [billingData, setBillingData] = useState<BillingData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    country: 'LT',
  });
  
  const [selectedShipping, setSelectedShipping] = useState<ShippingMethod | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  
  const [deviceProduct, setDeviceProduct] = useState<any>(null);
  const [filterProducts, setFilterProducts] = useState<any[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [shippingMethods, setShippingMethods] = useState<ShippingMethod[]>([]);

  useEffect(() => {
    loadProducts();
    loadShippingMethods();
  }, []);

  const loadProducts = async () => {
    try {
      setProductsLoading(true);
      const products = await fetchWCProducts();
      
      const device = products.find((p: any) => 
        p.categories?.some((c: any) => c.slug === 'irenginiai')
      );
      if (device) {
        setDeviceProduct(transformWCProduct(device));
      }
      
      const filters = products
        .filter((p: any) => 
          p.categories?.some((c: any) => c.slug === 'filtrai')
        )
        .map(transformWCProduct);
      
      setFilterProducts(filters);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setProductsLoading(false);
    }
  };

  const loadShippingMethods = async () => {
    try {
      const response = await fetch('/wp-json/wc/v3/shipping/zones');
      if (!response.ok) throw new Error('Failed');
      
      const zones = await response.json();
      console.log('Shipping zones loaded:', zones);
      
      let allMethods: ShippingMethod[] = [];
      
      for (const zone of zones) {
        try {
          const methodsResponse = await fetch(`/wp-json/wc/v3/shipping/zones/${zone.id}/methods`);
          if (methodsResponse.ok) {
            const methods = await methodsResponse.json();
            console.log(`Methods for zone ${zone.name}:`, methods);
            
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
        console.log('Loaded shipping methods:', allMethods);
        setShippingMethods(allMethods);
      } else {
        console.warn('No shipping methods found, using defaults');
        setShippingMethods([
          { id: 'flat_rate', title: 'Standartinis pristatymas', cost: 2.99, description: '2-3 darbo dienos' },
        ]);
      }
    } catch (error) {
      console.error('Error loading shipping methods:', error);
      setShippingMethods([
        { id: 'flat_rate', title: 'Standartinis pristatymas', cost: 2.99, description: '2-3 darbo dienos' },
      ]);
    }
  };

  // Helper functions for flavor selection
  const getMaxPacks = () => {
    return packSize === '3-pack' ? 3 : packSize === '6-pack' ? 6 : 12;
  };

  const getRequiredPacks = () => {
    return packSize === 'complete-pack' ? 12 : getMaxPacks();
  };

  const handlePackToggle = (pack: any) => {
    const requiredPacks = getRequiredPacks();
    
    if (selectedPacks.find(p => p.id === pack.id)) {
      setSelectedPacks(selectedPacks.filter(p => p.id !== pack.id));
    } else if (selectedPacks.length < requiredPacks) {
      setSelectedPacks([...selectedPacks, pack]);
    }
  };

  // Validation
  const canProceed = (drawer: number): boolean => {
    switch (drawer) {
      case 1: // Devices
        return device1 !== null && device2 !== null;
      case 2: // Flavors
        return selectedPacks.length === getRequiredPacks();
      case 3: // Billing
        return !!(
          billingData.firstName &&
          billingData.lastName &&
          billingData.email &&
          billingData.phone &&
          billingData.address &&
          billingData.city &&
          billingData.postalCode
        );
      case 4: // Shipping
        return selectedShipping !== null;
      default:
        return false;
    }
  };

  const handleContinue = (drawer: number) => {
    if (!canProceed(drawer)) {
      setErrors([`Užpildykite visus privalomus laukus`]);
      return;
    }
    setErrors([]);
    setCompletedDrawers([...completedDrawers, drawer]);
    setOpenDrawer(drawer + 1);
  };

  // Payment methods
  const paymentMethods: PaymentMethod[] = [
    { 
      id: 'card', 
      title: 'Banko kortelė', 
      logo: 'https://www.mastercard.com/content/dam/mccom/shared/header/ma_symbol.svg',
    },
    { 
      id: 'apple_pay', 
      title: 'Apple Pay', 
      logo: 'https://upload.wikimedia.org/wikipedia/commons/b/b0/Apple_Pay_logo.svg',
    },
    { 
      id: 'google_pay', 
      title: 'Google Pay', 
      logo: 'https://upload.wikimedia.org/wikipedia/commons/f/f2/Google_Pay_Logo.svg',
    },
    { 
      id: 'swedbank', 
      title: 'Swedbank', 
      logo: 'https://www.swedbank.lt/webjars/webcomponents/3.31.0/assets/images/swedbank-logo.svg',
    },
    { 
      id: 'seb', 
      title: 'SEB', 
      logo: 'https://upload.wikimedia.org/wikipedia/commons/6/65/SEB_Logo.svg',
    },
    { 
      id: 'luminor', 
      title: 'Luminor', 
      logo: 'https://www.luminor.lt/sites/all/themes/dnb_theme/images/luminor-logo.svg',
    },
  ];

  // Calculate totals
  const cartTotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const devicesPrice = (device1 && device2 && deviceProduct) ? deviceProduct.price * 2 : 0;
  const packsTotal = selectedPacks.reduce((sum, pack) => sum + pack.price, 0);
  const shippingCost = selectedShipping?.cost || 0;
  const subtotal = cartTotal + devicesPrice + packsTotal;
  const total = subtotal + shippingCost;

  // Complete order
  const handleCompleteOrder = async () => {
    if (!selectedPayment) {
      setErrors(['Pasirinkite mokėjimo būdą']);
      return;
    }

    setLoading(true);
    setErrors([]);

    try {
      const lineItems: any[] = [];

      // Add cart items (Kartu Rinkinys)
      items.forEach(item => {
        lineItems.push({
          product_id: item.wcId,
          quantity: item.quantity,
        });
      });

      // Add both devices with meta
      if (device1 && device2 && deviceProduct) {
        lineItems.push({
          product_id: deviceProduct.wcId,
          quantity: 1,
          meta_data: [
            { key: 'Spalva', value: `${device1.name} (Pirmas)` }
          ],
        });
        lineItems.push({
          product_id: deviceProduct.wcId,
          quantity: 1,
          meta_data: [
            { key: 'Spalva', value: `${device2.name} (Antras)` }
          ],
        });
      }

      // Add flavor packs
      selectedPacks.forEach(pack => {
        lineItems.push({
          product_id: pack.wcId,
          quantity: 1,
          meta_data: [{ key: 'Skonis', value: pack.name }],
        });
      });

      // Create order
      const orderData = {
        status: 'pending',
        billing: {
          first_name: billingData.firstName,
          last_name: billingData.lastName,
          address_1: billingData.address,
          city: billingData.city,
          postcode: billingData.postalCode,
          country: billingData.country,
          email: billingData.email,
          phone: billingData.phone,
        },
        shipping: {
          first_name: billingData.firstName,
          last_name: billingData.lastName,
          address_1: billingData.address,
          city: billingData.city,
          postcode: billingData.postalCode,
          country: billingData.country,
        },
        line_items: lineItems,
        shipping_lines: [
          {
            method_id: selectedShipping?.id || 'flat_rate',
            method_title: selectedShipping?.title || 'Shipping',
            total: shippingCost.toFixed(2),
          },
        ],
        payment_method: selectedPayment.id,
        payment_method_title: selectedPayment.title,
        customer_note: `Kartu Rinkinys: ${device1.name} + ${device2.name} | Mokėjimas: ${selectedPayment.title} | Skoniai: ${selectedPacks.map(p => p.name).join(', ')}`,
      };

      const response = await fetch('/wp-json/wc/v3/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) throw new Error('Order creation failed');

      const order = await response.json();
      console.log('Order created:', order);

      clearCart();
      navigate(`/order-received/${order.id}`);
    } catch (error) {
      console.error('Error creating order:', error);
      setErrors(['Nepavyko sukurti užsakymo. Bandykite dar kartą.']);
    } finally {
      setLoading(false);
    }
  };

  // Drawer Header Component
  const DrawerHeader: React.FC<{
    num: number;
    title: string;
    isOpen: boolean;
    isCompleted: boolean;
    canOpen: boolean;
  }> = ({ num, title, isOpen, isCompleted, canOpen }) => (
    <button
      onClick={() => canOpen && setOpenDrawer(isOpen ? 0 : num)}
      disabled={!canOpen}
      className={`w-full flex items-center justify-between p-6 transition-all ${
        !canOpen ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'
      }`}
    >
      <div className="flex items-center gap-4">
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
            isCompleted
              ? 'bg-[#15803d] text-white'
              : isOpen
              ? 'bg-[#15803d] text-white'
              : 'bg-gray-200 text-gray-600'
          }`}
        >
          {isCompleted ? <Check size={20} /> : num}
        </div>
        <span className={`font-bold ${isOpen ? 'text-[#15803d]' : 'text-gray-700'}`}>
          {title}
        </span>
      </div>
      {canOpen && (isOpen ? <ChevronUp /> : <ChevronDown />)}
    </button>
  );

  // Device colors from woocommerce service
  const deviceColors = deviceProduct?.variations || DEVICE_COLORS;

  if (productsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#f0fdf4] to-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#15803d] mb-4"></div>
          <p className="text-gray-600">Kraunami produktai...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f0fdf4] to-white py-8 px-4">
      <div className="max-w-4xl mx-auto">
        
        {/* Header with Filtru Klubas Image */}
        <div className="mb-8 text-center bg-gradient-to-r from-blue-50 via-green-50 to-blue-50 rounded-2xl p-6">
          <Users className="inline-block text-[#15803d] mb-2" size={32} />
          <h1 className="text-3xl font-bold text-[#1a1a1a] mb-2">
            👥 Kartu Rinkinys
          </h1>
          <p className="text-gray-700 mb-4">
            Dviem asmenims - du įrenginiai kartu
          </p>
          
          {/* Custom Filtru Klubas Image */}
          <div className="mt-4">
            <img 
              src="/wp-content/themes/oru-theme/dist/images/filtruklubas.png" 
              alt="Filtrų Klubas" 
              className="mx-auto max-w-md w-full h-auto rounded-xl shadow-lg"
              onError={(e) => {
                console.error('Failed to load filtruklubas.png from:', e.currentTarget.src);
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </div>
        </div>

        {/* Error Messages */}
        {errors.length > 0 && (
          <div className="mb-6 bg-red-50 border-2 border-red-200 rounded-xl p-4">
            {errors.map((error, i) => (
              <p key={i} className="text-red-700">{error}</p>
            ))}
          </div>
        )}

        {/* DRAWER 1: Two Device Selections */}
        <div className="bg-white rounded-2xl shadow-sm mb-4 border-2 border-gray-200 overflow-hidden">
          <DrawerHeader
            num={1}
            title="Du Įrenginiai (Privaloma)"
            isOpen={openDrawer === 1}
            isCompleted={completedDrawers.includes(1)}
            canOpen={true}
          />

          {openDrawer === 1 && (
            <div className="p-6 border-t border-gray-200 space-y-8">
              {/* Device 1 */}
              <div className="bg-blue-50 rounded-xl p-6">
                <h3 className="text-xl font-bold text-blue-900 mb-4 flex items-center gap-2">
                  🎯 Pirmas Įrenginys
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  {deviceColors.map((device: any, idx: number) => (
                    <button
                      key={idx}
                      onClick={() => setDevice1(device)}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        device1?.name === device.name
                          ? 'border-blue-600 bg-blue-100 shadow-lg transform scale-105'
                          : 'border-gray-200 hover:border-blue-300 hover:shadow-md'
                      }`}
                    >
                      <div className="flex gap-0.5 justify-center mb-2">
                        <div className="w-8 h-8 rounded-full border-2 border-white shadow-sm" style={{ backgroundColor: device.metalColor }} />
                        <div className="w-8 h-8 rounded-full border-2 border-white shadow-sm -ml-1" style={{ backgroundColor: device.woodColor }} />
                      </div>
                      <p className="text-sm font-medium text-center">{device.name}</p>
                      {device1?.name === device.name && (
                        <div className="mt-2 flex justify-center">
                          <Check className="text-blue-600" size={20} />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Device 2 */}
              <div className="bg-green-50 rounded-xl p-6">
                <h3 className="text-xl font-bold text-green-900 mb-4 flex items-center gap-2">
                  🎯 Antras Įrenginys
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  {deviceColors.map((device: any, idx: number) => (
                    <button
                      key={idx}
                      onClick={() => setDevice2(device)}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        device2?.name === device.name
                          ? 'border-green-600 bg-green-100 shadow-lg transform scale-105'
                          : 'border-gray-200 hover:border-green-300 hover:shadow-md'
                      }`}
                    >
                      <div className="flex gap-0.5 justify-center mb-2">
                        <div className="w-8 h-8 rounded-full border-2 border-white shadow-sm" style={{ backgroundColor: device.metalColor }} />
                        <div className="w-8 h-8 rounded-full border-2 border-white shadow-sm -ml-1" style={{ backgroundColor: device.woodColor }} />
                      </div>
                      <p className="text-sm font-medium text-center">{device.name}</p>
                      {device2?.name === device.name && (
                        <div className="mt-2 flex justify-center">
                          <Check className="text-green-600" size={20} />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={() => handleContinue(1)}
                disabled={!canProceed(1)}
                className={`w-full py-4 rounded-xl font-bold transition-all ${
                  canProceed(1)
                    ? 'bg-[#15803d] text-white hover:bg-[#15803d]/90'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Tęsti
              </button>
            </div>
          )}
        </div>

        {/* DRAWER 2: Flavor Selection */}
        <div className="bg-white rounded-2xl shadow-sm mb-4 border-2 border-gray-200 overflow-hidden">
          <DrawerHeader
            num={2}
            title="Skonių Filtrai (Privaloma)"
            isOpen={openDrawer === 2}
            isCompleted={completedDrawers.includes(2)}
            canOpen={completedDrawers.includes(1)}
          />

          {openDrawer === 2 && (
            <div className="p-6 border-t border-gray-200">
              {/* Pack Size Selector */}
              <div className="flex gap-2 mb-6">
                <button
                  onClick={() => {
                    setPackSize('3-pack');
                    setSelectedPacks([]);
                  }}
                  className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${
                    packSize === '3-pack'
                      ? 'bg-[#15803d] text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  3 PAKUOTĖS
                </button>
                <button
                  onClick={() => {
                    setPackSize('6-pack');
                    setSelectedPacks([]);
                  }}
                  className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${
                    packSize === '6-pack'
                      ? 'bg-[#15803d] text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  6 PAKUOTĖS
                </button>
                <button
                  onClick={() => {
                    setPackSize('complete-pack');
                    setSelectedPacks([]);
                  }}
                  className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all relative ${
                    packSize === 'complete-pack'
                      ? 'bg-[#15803d] text-white'
                      : 'bg-[#FFF9C4] text-[#1a1a1a] hover:bg-[#FFF59D]'
                  }`}
                >
                  {packSize !== 'complete-pack' && (
                    <span className="absolute -top-2 -right-1 bg-red-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">
                      BEST
                    </span>
                  )}
                  <div className="text-[10px] leading-tight">PILNAS</div>
                  <div className="text-[9px] font-normal">12 skonių</div>
                </button>
              </div>

              {/* Progress */}
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Pažymėta</span>
                  <span className="font-bold text-[#15803d]">
                    {selectedPacks.length} / {getRequiredPacks()}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-[#15803d] h-2 rounded-full transition-all"
                    style={{ width: `${(selectedPacks.length / getRequiredPacks()) * 100}%` }}
                  />
                </div>
              </div>

              {/* Flavor Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
                {filterProducts.map((pack) => {
                  const isSelected = selectedPacks.find(p => p.id === pack.id);
                  const isDisabled = selectedPacks.length >= getRequiredPacks() && !isSelected;

                  return (
                    <button
                      key={pack.id}
                      onClick={() => handlePackToggle(pack)}
                      disabled={isDisabled}
                      className={`w-full aspect-square rounded-2xl border-2 transition-all flex flex-col items-center justify-center relative ${
                        isSelected
                          ? 'border-[#15803d] bg-[#15803d]/10'
                          : isDisabled
                          ? 'border-gray-100 opacity-40 cursor-not-allowed'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-[#15803d] rounded-full flex items-center justify-center border-2 border-white shadow-lg z-10">
                          <Check className="text-white" size={14} />
                        </div>
                      )}
                      
                      {pack.image ? (
                        <img 
                          src={pack.image} 
                          alt={pack.name} 
                          className="w-12 h-12 object-cover rounded-lg mb-2"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-200 rounded-lg mb-2 flex items-center justify-center text-2xl">
                          🌿
                        </div>
                      )}
                      
                      <div className="text-[9px] font-bold text-[#1a1a1a] text-center leading-tight px-1">
                        {pack.name}
                      </div>
                      <div className="text-[8px] text-gray-500 mt-0.5">
                        {pack.price.toFixed(2)} €
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setOpenDrawer(1)}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-300"
                >
                  Atgal
                </button>
                <button
                  onClick={() => handleContinue(2)}
                  disabled={!canProceed(2)}
                  className={`flex-1 py-4 rounded-xl font-bold transition-all ${
                    canProceed(2)
                      ? 'bg-[#15803d] text-white hover:bg-[#15803d]/90'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Tęsti ({selectedPacks.length}/{getRequiredPacks()})
                </button>
              </div>
            </div>
          )}
        </div>

        {/* DRAWER 3: Billing Information */}
        <div className="bg-white rounded-2xl shadow-sm mb-4 border-2 border-gray-200 overflow-hidden">
          <DrawerHeader
            num={3}
            title="Pristatymo Informacija"
            isOpen={openDrawer === 3}
            isCompleted={completedDrawers.includes(3)}
            canOpen={completedDrawers.includes(2)}
          />

          {openDrawer === 3 && (
            <div className="p-6 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <input
                  type="text"
                  placeholder="Vardas *"
                  value={billingData.firstName}
                  onChange={(e) => setBillingData({ ...billingData, firstName: e.target.value })}
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#15803d]"
                />
                <input
                  type="text"
                  placeholder="Pavardė *"
                  value={billingData.lastName}
                  onChange={(e) => setBillingData({ ...billingData, lastName: e.target.value })}
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#15803d]"
                />
                <input
                  type="email"
                  placeholder="El. paštas *"
                  value={billingData.email}
                  onChange={(e) => setBillingData({ ...billingData, email: e.target.value })}
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#15803d]"
                />
                <input
                  type="tel"
                  placeholder="Telefonas *"
                  value={billingData.phone}
                  onChange={(e) => setBillingData({ ...billingData, phone: e.target.value })}
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#15803d]"
                />
                <input
                  type="text"
                  placeholder="Adresas *"
                  value={billingData.address}
                  onChange={(e) => setBillingData({ ...billingData, address: e.target.value })}
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#15803d] md:col-span-2"
                />
                <input
                  type="text"
                  placeholder="Miestas *"
                  value={billingData.city}
                  onChange={(e) => setBillingData({ ...billingData, city: e.target.value })}
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#15803d]"
                />
                <input
                  type="text"
                  placeholder="Pašto kodas *"
                  value={billingData.postalCode}
                  onChange={(e) => setBillingData({ ...billingData, postalCode: e.target.value })}
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#15803d]"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setOpenDrawer(2)}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-300"
                >
                  Atgal
                </button>
                <button
                  onClick={() => handleContinue(3)}
                  disabled={!canProceed(3)}
                  className={`flex-1 py-4 rounded-xl font-bold ${
                    canProceed(3)
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

        {/* DRAWER 4: Shipping Method */}
        <div className="bg-white rounded-2xl shadow-sm mb-4 border-2 border-gray-200 overflow-hidden">
          <DrawerHeader
            num={4}
            title="Pristatymo Būdas"
            isOpen={openDrawer === 4}
            isCompleted={completedDrawers.includes(4)}
            canOpen={completedDrawers.includes(3)}
          />

          {openDrawer === 4 && (
            <div className="p-6 border-t border-gray-200">
              <div className="space-y-3 mb-6">
                {shippingMethods.map((method) => (
                  <button
                    key={method.id}
                    onClick={() => setSelectedShipping(method)}
                    className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                      selectedShipping?.id === method.id
                        ? 'border-[#15803d] bg-[#15803d]/10'
                        : 'border-gray-200 hover:border-[#15803d]'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-bold">{method.title}</p>
                        {method.description && (
                          <p className="text-sm text-gray-600">{method.description}</p>
                        )}
                      </div>
                      <p className="font-bold text-[#15803d]">
                        {method.cost === 0 ? 'Nemokamai' : `€${method.cost.toFixed(2)}`}
                      </p>
                    </div>
                  </button>
                ))}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setOpenDrawer(3)}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-300"
                >
                  Atgal
                </button>
                <button
                  onClick={() => handleContinue(4)}
                  disabled={!canProceed(4)}
                  className={`flex-1 py-4 rounded-xl font-bold ${
                    canProceed(4)
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

        {/* DRAWER 5: Payment & Confirmation */}
        <div className="bg-white rounded-2xl shadow-sm mb-4 border-2 border-gray-200 overflow-hidden">
          <DrawerHeader
            num={5}
            title="Mokėjimas ir Patvirtinimas"
            isOpen={openDrawer === 5}
            isCompleted={false}
            canOpen={completedDrawers.includes(4)}
          />

          {openDrawer === 5 && (
            <div className="p-6 border-t border-gray-200">
              {/* Payment Methods */}
              <h3 className="font-bold text-lg mb-4">Pasirinkite Mokėjimo Būdą</h3>
              <div className="grid grid-cols-3 gap-3 mb-6">
                {paymentMethods.map((method) => (
                  <button
                    key={method.id}
                    onClick={() => setSelectedPayment(method)}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      selectedPayment?.id === method.id
                        ? 'border-[#15803d] bg-[#15803d]/10'
                        : 'border-gray-200 hover:border-[#15803d]'
                    }`}
                  >
                    {method.logo ? (
                      <img
                        src={method.logo}
                        alt={method.title}
                        className="h-8 w-full object-contain mb-2"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                          (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                    ) : null}
                    <span className={`text-2xl ${method.logo ? 'hidden' : ''}`}>
                      {method.emoji || '💳'}
                    </span>
                    <p className="text-xs font-medium mt-2">{method.title}</p>
                  </button>
                ))}
              </div>

              {/* Order Summary */}
              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <h3 className="font-bold mb-3">Užsakymo Santrauka</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Kartu Rinkinys (krepšelis)</span>
                    <span>€{cartTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>2 Įrenginiai ({device1?.name}, {device2?.name})</span>
                    <span>€{devicesPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{selectedPacks.length} Skonių filtrai</span>
                    <span>€{packsTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Pristatymas</span>
                    <span>{shippingCost === 0 ? 'Nemokamai' : `€${shippingCost.toFixed(2)}`}</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between font-bold text-lg">
                    <span>Iš Viso</span>
                    <span className="text-[#15803d]">€{total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setOpenDrawer(4)}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-300"
                >
                  Atgal
                </button>
                <button
                  onClick={handleCompleteOrder}
                  disabled={loading || !selectedPayment}
                  className={`flex-1 py-4 rounded-xl font-bold text-lg transition-all ${
                    loading || !selectedPayment
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-[#15803d] text-white hover:bg-[#15803d]/90 shadow-lg'
                  }`}
                >
                  {loading ? 'Kuriamas užsakymas...' : `APMOKĖTI €${total.toFixed(2)}`}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CheckoutCouple;