import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { Check, Info, ArrowLeft, Loader, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import {
  createOrder,
  createSubscription,
  validateBillingInfo,
  calculateTotal,
  calculateSubscriptionDiscount,
  formatPrice,
  DEVICE_COLORS,
  fetchWCProducts,
  transformWCProduct,
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

const Checkout: React.FC = () => {
  const { items, clearCart, cartTotal } = useCart();
  const navigate = useNavigate();
  
  // Drawer states
  const [openDrawer, setOpenDrawer] = useState<number>(1);
  const [completedDrawers, setCompletedDrawers] = useState<number[]>([]);
  
  // Selection states
  const [selectedDevice, setSelectedDevice] = useState<any>(null);
  const [packSize, setPackSize] = useState<'3-pack' | '6-pack' | 'complete-pack'>('3-pack');
  const [selectedPacks, setSelectedPacks] = useState<any[]>([]);
  const [isSubscription, setIsSubscription] = useState(true);
  const [selectedShipping, setSelectedShipping] = useState<ShippingMethod | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  
  // Product data
  const [deviceProduct, setDeviceProduct] = useState<any>(null);
  const [filterProducts, setFilterProducts] = useState<any[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [shippingMethods, setShippingMethods] = useState<ShippingMethod[]>([]);
  const [shippingLoading, setShippingLoading] = useState(true);
  const [selectedPickupPoint, setSelectedPickupPoint] = useState<any>(null);
  const [pickupLocations, setPickupLocations] = useState<any[]>([]);
  const [loadingLocations, setLoadingLocations] = useState(false);
  
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

  const paymentMethods: PaymentMethod[] = [
    { 
      id: 'card', 
      name: 'Banko kortelė', 
      logo: 'https://www.mastercard.com/content/dam/mccom/shared/header/ma_symbol.svg',
      type: 'card' 
    },
    { 
      id: 'apple_pay', 
      name: 'Apple Pay', 
      logo: 'https://upload.wikimedia.org/wikipedia/commons/b/b0/Apple_Pay_logo.svg',
      type: 'card' 
    },
    { 
      id: 'google_pay', 
      name: 'Google Pay', 
      logo: 'https://upload.wikimedia.org/wikipedia/commons/f/f2/Google_Pay_Logo.svg',
      type: 'card' 
    },
    { 
      id: 'swedbank', 
      name: 'Swedbank', 
      logo: 'https://www.swedbank.lt/webjars/webcomponents/3.31.0/assets/images/swedbank-logo.svg',
      type: 'bank' 
    },
    { 
      id: 'seb', 
      name: 'SEB', 
      logo: 'https://upload.wikimedia.org/wikipedia/commons/6/65/SEB_Logo.svg',
      type: 'bank' 
    },
    { 
      id: 'luminor', 
      name: 'Luminor', 
      logo: 'https://www.luminor.lt/sites/all/themes/dnb_theme/images/luminor-logo.svg',
      type: 'bank' 
    },
  ];

  // Load products and shipping methods
  useEffect(() => {
    loadProducts();
    loadShippingMethods();
  }, []);

  const loadProducts = async () => {
    try {
      setProductsLoading(true);
      const products = await fetchWCProducts();
      
      const device = products.find((p: any) => 
        p.categories?.some((c: any) => c.slug === 'irenginiai') ||
        p.name.includes('Įrenginys')
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
      setShippingLoading(true);
      console.log('🚚 Starting to load shipping methods...');
      
      const zonesResponse = await fetch('/wp-json/wc/v3/shipping/zones', {
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!zonesResponse.ok) {
        throw new Error(`Zones fetch failed: ${zonesResponse.status}`);
      }
      
      const zones = await zonesResponse.json();
      console.log('📦 Loaded zones:', zones);
      
      let allMethods: ShippingMethod[] = [];
      
      for (const zone of zones) {
        console.log(`🔍 Checking zone: ${zone.name} (ID: ${zone.id})`);
        
        try {
          const methodsResponse = await fetch(`/wp-json/wc/v3/shipping/zones/${zone.id}/methods`, {
            headers: {
              'Content-Type': 'application/json',
            }
          });
          
          if (!methodsResponse.ok) {
            console.warn(`⚠️ Failed to load methods for zone ${zone.id}: ${methodsResponse.status}`);
            continue;
          }
          
          const methods = await methodsResponse.json();
          console.log(`📋 Methods in zone "${zone.name}":`, methods);
          
          methods.forEach((method: any) => {
            console.log(`  Method: ${method.method_title} (${method.id})`, {
              enabled: method.enabled,
              settings: method.settings
            });
            
            if (method.enabled) {
              const cost = parseFloat(method.settings?.cost?.value || '0');
              const minAmount = parseFloat(method.settings?.min_amount?.value || '0');
              
              allMethods.push({
                id: method.instance_id?.toString() || method.id,
                title: method.title || method.method_title,
                cost: cost,
                description: minAmount > 0 
                  ? `Nemokamai nuo €${minAmount.toFixed(2)}` 
                  : (method.method_description || '2-3 darbo dienos'),
              });
              
              console.log(`  ✅ Added: ${method.method_title} - €${cost}`);
            } else {
              console.log(`  ❌ Skipped (disabled): ${method.method_title}`);
            }
          });
        } catch (error) {
          console.error(`❌ Error loading methods for zone ${zone.id}:`, error);
        }
      }
      
      console.log('📦 Total shipping methods found:', allMethods.length);
      console.log('🚚 Final shipping methods:', allMethods);
      
      if (allMethods.length > 0) {
        setShippingMethods(allMethods);
        console.log('✅ Shipping methods set successfully');
      } else {
        console.warn('⚠️ No shipping methods found, using defaults');
        setDefaultShippingMethods();
      }
    } catch (error) {
      console.error('❌ Error loading shipping methods:', error);
      setDefaultShippingMethods();
    } finally {
      setShippingLoading(false);
    }
  };

  const setDefaultShippingMethods = () => {
    const defaultMethods = [
      { 
        id: 'flat_rate', 
        title: 'Standartinis pristatymas', 
        cost: 2.99, 
        description: '2-3 darbo dienos' 
      },
      { 
        id: 'free_shipping', 
        title: 'Nemokamas pristatymas', 
        cost: 0, 
        description: 'Užsakymams nuo €40' 
      },
    ];
    setShippingMethods(defaultMethods);
    console.log('📦 Set default shipping methods:', defaultMethods);
  };

  // Check if shipping method requires pickup point selection
  const requiresPickupPoint = (methodTitle: string): boolean => {
    const title = methodTitle.toLowerCase();
    return title.includes('omniva') || 
           title.includes('dpd') || 
           title.includes('smartpost') || 
           title.includes('venipak') ||
           title.includes('inpost');
  };

  // Get provider name from shipping method title
  const getProviderFromMethod = (methodTitle: string): string => {
    const title = methodTitle.toLowerCase();
    if (title.includes('omniva')) return 'omniva';
    if (title.includes('dpd')) return 'dpd';
    if (title.includes('smartpost')) return 'smartpost';
    if (title.includes('venipak')) return 'venipak';
    if (title.includes('inpost')) return 'inpost';
    return 'omniva';
  };

  // Get shipping method logo (YOUR CUSTOM SVG LINKS)
  const getShippingLogo = (methodTitle: string): string | null => {
    const title = methodTitle.toLowerCase();
    if (title.includes('omniva')) {
      return 'https://reversw.netlify.app/omniva.svg';
    }
    if (title.includes('dpd')) {
      return 'https://www.qapla.io/wp-content/uploads/2023/04/DPD.svg';
    }
    if (title.includes('smartpost') || title.includes('smartposti')) {
      return 'https://www.itella.fi/themes/custom/ip_theme/logo.svg';
    }
    if (title.includes('venipak')) {
      return 'https://reversw.netlify.app/venipak.svg';
    }
    if (title.includes('inpost')) {
      return 'https://inpost.eu/themes/custom/vk_inpost/assets/icons/inpost-logo-blue.svg';
    }
    return null;
  };

  // Get delivery time estimate for shipping method
  const getDeliveryTime = (methodTitle: string): string => {
    const title = methodTitle.toLowerCase();
    
    if (title.includes('omniva')) return '1-2 d. pristatymas';
    if (title.includes('dpd')) return '1-3 d. pristatymas';
    if (title.includes('venipak')) return '2-3 d. pristatymas';
    if (title.includes('smartpost') || title.includes('smartposti')) return '2-4 d. pristatymas';
    if (title.includes('inpost')) return '2-3 d. pristatymas';
    if (title.includes('courier') || title.includes('kurjeris')) return '1-2 d. pristatymas';
    if (title.includes('free') || title.includes('nemokamas')) return '3-5 d. pristatymas';
    
    return '2-3 d. pristatymas';
  };

  // Check if this is the fastest shipping method
  const isFastestShipping = (methodTitle: string): boolean => {
    const title = methodTitle.toLowerCase();
    return title.includes('omniva') || (title.includes('courier') && !title.includes('venipak'));
  };

  // Get clean shipping method name (remove Montonio suffix)
  const getCleanShippingName = (methodTitle: string): string => {
    return methodTitle
      .replace(/\s*-\s*Montonio/gi, '')
      .replace(/\s*\(.*?\)/g, '')
      .trim();
  };

  // Load pickup locations from custom REST endpoint
  const loadPickupLocations = async (shippingMethod: ShippingMethod) => {
    if (!requiresPickupPoint(shippingMethod.title)) {
      setPickupLocations([]);
      setSelectedPickupPoint(null);
      return;
    }

    setLoadingLocations(true);
    console.log('🔍 Loading pickup locations for:', shippingMethod.title);
    
    try {
      const provider = getProviderFromMethod(shippingMethod.title);
      
      // Try custom endpoint first
      const customResponse = await fetch(`/wp-json/oru/v1/pickup-points/${provider}`);
      
      if (customResponse.ok) {
        const data = await customResponse.json();
        console.log('📍 Custom endpoint response:', data);
        
        if (Array.isArray(data) && data.length > 0) {
          setPickupLocations(data);
          console.log('✅ Loaded pickup locations from custom endpoint:', data);
          setLoadingLocations(false);
          return;
        }
      }
      
      // Fallback: Try WooCommerce settings endpoint
      const settingsResponse = await fetch(`/wp-json/wc/v3/settings/montonio_${provider}/pickup_points`);
      
      if (settingsResponse.ok) {
        const data = await settingsResponse.json();
        console.log('📍 Settings endpoint response:', data);
        
        if (data.value) {
          const locations = typeof data.value === 'string' ? JSON.parse(data.value) : data.value;
          if (Array.isArray(locations) && locations.length > 0) {
            setPickupLocations(locations);
            console.log('✅ Loaded pickup locations from settings:', locations);
            setLoadingLocations(false);
            return;
          }
        }
      }
      
      console.log('⚠️ No pickup locations found - showing manual input');
      setPickupLocations([]);
      
    } catch (error) {
      console.error('❌ Error loading pickup locations:', error);
      setPickupLocations([]);
    } finally {
      setLoadingLocations(false);
    }
  };

  // Calculate required pack count based on selection
  const getMaxPacks = () => {
    return packSize === '3-pack' ? 3 : packSize === '6-pack' ? 6 : 12;
  };

  const getRequiredPacks = () => {
    return packSize === 'complete-pack' ? 12 : getMaxPacks();
  };

  // Calculate totals
  const devicePrice = selectedDevice && deviceProduct ? deviceProduct.price : 0;
  const packsTotal = selectedPacks.reduce((sum, pack) => sum + pack.price, 0);
  const subtotal = cartTotal + devicePrice + packsTotal;
  const shippingCost = selectedShipping?.cost || 0;
  const subscriptionDiscount = isSubscription ? calculateSubscriptionDiscount(subtotal) : 0;
  const total = subtotal + shippingCost - subscriptionDiscount;

  const handlePackToggle = (pack: any) => {
    const requiredPacks = getRequiredPacks();
    
    if (selectedPacks.find(p => p.id === pack.id)) {
      setSelectedPacks(selectedPacks.filter(p => p.id !== pack.id));
    } else if (selectedPacks.length < requiredPacks) {
      setSelectedPacks([...selectedPacks, pack]);
    }
  };

  const handleBillingChange = (field: keyof OrderData['billing'], value: string) => {
    setBillingInfo(prev => ({ ...prev, [field]: value }));
    setErrors([]);
  };

  const canProceedToNextDrawer = (drawerNum: number): boolean => {
    switch (drawerNum) {
      case 1:
        return selectedDevice !== null;
      case 2:
        return selectedPacks.length === getRequiredPacks();
      case 3:
        return validateBillingInfo(billingInfo).length === 0;
      case 4:
        if (!selectedShipping) return false;
        if (requiresPickupPoint(selectedShipping.title) && !selectedPickupPoint) {
          return false;
        }
        return true;
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
        return 'Prašome pasirinkti įrenginį';
      case 2:
        return `Prašome pasirinkti ${getRequiredPacks()} skonius`;
      case 3:
        return 'Prašome užpildyti visus privalomus laukus';
      case 4:
        if (!selectedShipping) {
          return 'Prašome pasirinkti pristatymo būdą';
        }
        if (requiresPickupPoint(selectedShipping.title) && !selectedPickupPoint) {
          return 'Prašome pasirinkti paštomatą';
        }
        return 'Prašome užpildyti šį žingsnį';
      default:
        return 'Prašome užpildyti šį žingsnį';
    }
  };

  const handleCheckout = async () => {
    setLoading(true);
    setErrors([]);

    try {
      if (!selectedDevice) {
        throw new Error('Nepasirinktas įrenginys');
      }
      
      if (selectedPacks.length !== getRequiredPacks()) {
        throw new Error(`Reikia pasirinkti ${getRequiredPacks()} skonius`);
      }
      
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

      const lineItems: any[] = [];

      items.forEach(item => {
        lineItems.push({
          product_id: parseInt(item.wcId || item.id.replace('wc-', '')),
          quantity: item.quantity,
          meta_data: [
            ...(item.selectedVariant ? [{ key: 'Skonis', value: item.selectedVariant }] : []),
            ...(item.selectedColor ? [{ key: 'Spalva', value: item.selectedColor }] : []),
          ],
        });
      });

      lineItems.push({
        product_id: deviceProduct.wcId,
        quantity: 1,
        meta_data: [
          { key: 'Spalva', value: selectedDevice.name },
        ],
      });

      selectedPacks.forEach(pack => {
        lineItems.push({
          product_id: pack.wcId,
          quantity: 1,
          meta_data: [
            { key: 'Skonis', value: pack.name },
          ],
        });
      });

      const orderData: OrderData = {
        billing: billingInfo,
        line_items: lineItems,
        is_subscription: isSubscription,
        shipping_lines: [
          {
            method_id: selectedShipping.id,
            method_title: selectedShipping.title,
            total: selectedShipping.cost.toString(),
            meta_data: selectedPickupPoint ? [
              {
                key: '_montonio_pickup_point_id',
                value: selectedPickupPoint.id || selectedPickupPoint.uuid
              },
              {
                key: '_montonio_pickup_point_name',
                value: selectedPickupPoint.name
              },
              {
                key: '_montonio_pickup_point_address',
                value: selectedPickupPoint.address
              },
              {
                key: '_montonio_pickup_point_provider',
                value: getProviderFromMethod(selectedShipping.title)
              }
            ] : []
          }
        ],
        payment_method: 'montonio',
        payment_method_title: selectedPayment.name,
        customer_note: `Mokėjimo būdas: ${selectedPayment.name}${isSubscription ? ' | Prenumerata' : ''}${
          selectedPickupPoint ? `\nPaštomat as: ${selectedPickupPoint.name}, ${selectedPickupPoint.address}` : ''
        }`,
      };

      console.log('Creating order with data:', orderData);

      let response;
      if (isSubscription) {
        response = await createSubscription(orderData);
      } else {
        response = await createOrder(orderData);
      }

      console.log('Order creation response:', response);

      // 🎯 DISPLAY BACKEND DEBUG MESSAGES IN CONSOLE
      if (response._console && response._console.messages) {
        const style = response._console.type === 'success' 
          ? 'color: #10b981; font-weight: bold;'
          : 'color: #ef4444; font-weight: bold;';
        
        console.log(''); // Empty line
        console.log('%c========================================', 'color: #6b7280;');
        response._console.messages.forEach((msg: string) => {
          console.log(`%c${msg}`, style);
        });
        console.log('%c========================================', 'color: #6b7280;');
        console.log(''); // Empty line
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
        
        {/* Header */}
        <div className="mb-8">
          <Link to="/" className="inline-flex items-center text-gray-600 hover:text-forestGreen mb-4 transition-colors">
            <ArrowLeft size={20} className="mr-2" />
            Grįžti į parduotuvę
          </Link>
        </div>

        {/* Error Messages */}
        {errors.length > 0 && (
          <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4 mb-6 animate-fade-in-up">
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

        {/* DRAWER 1: Device Selection */}
        <div className="bg-white rounded-2xl shadow-sm mb-4 border-2 border-gray-200 overflow-hidden">
          <DrawerHeader 
            num={1} 
            title="Įrenginys (Privaloma)" 
            isOpen={openDrawer === 1}
            isCompleted={completedDrawers.includes(1)}
            canOpen={true}
          />
          
          {openDrawer === 1 && (
            <div className="p-6 border-t border-gray-200">
              {productsLoading ? (
                <div className="text-center py-8">
                  <Loader className="animate-spin mx-auto mb-2" size={24} />
                  <p className="text-sm text-gray-600">Kraunami produktai...</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {deviceProduct && DEVICE_COLORS.map((device, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedDevice(device)}
                      className={`w-full p-4 rounded-xl border-2 transition-all text-left flex items-center justify-between ${
                        selectedDevice?.name === device.name
                          ? 'border-[#15803d] bg-[#15803d]/10'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex gap-0.5">
                          <div className="w-6 h-6 rounded-full border-2 border-white shadow-sm" style={{ backgroundColor: device.metalColor }} />
                          <div className="w-6 h-6 rounded-full border-2 border-white shadow-sm -ml-1" style={{ backgroundColor: device.woodColor }} />
                        </div>
                        <span className="text-sm font-medium text-[#1a1a1a]">{device.name}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-[#15803d]">{deviceProduct.price.toFixed(2)} €</span>
                        {selectedDevice?.name === device.name && (
                          <div className="w-6 h-6 bg-[#15803d] rounded-full flex items-center justify-center">
                            <Check className="text-white" size={14} />
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                  
                  <button
                    onClick={() => handleContinue(1)}
                    disabled={!selectedDevice}
                    className={`w-full py-4 rounded-xl font-bold transition-all mt-6 ${
                      selectedDevice
                        ? 'bg-[#15803d] text-white hover:bg-[#15803d]/90'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    Tęsti
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* DRAWER 2: Flavor Pack Selection */}
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

              {/* Mandatory Selection Notice */}
              <div className="bg-[#FFF9C4] border border-[#FFE082] rounded-xl p-4 mb-6">
                <div className="flex items-start gap-3">
                  <Info size={20} className="text-[#F57C00] flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-[#1a1a1a] font-medium leading-snug">
                    <span className="font-bold">Privaloma:</span> Pasirinkite visus {getRequiredPacks()} skonius, kad galėtumėte tęsti.
                  </p>
                </div>
              </div>

              {/* Flavor Grid */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                {filterProducts.map((pack) => {
                  const isSelected = selectedPacks.find(p => p.id === pack.id);
                  const canSelect = selectedPacks.length < getRequiredPacks();
                  
                  return (
                    <button
                      key={pack.id}
                      onClick={() => handlePackToggle(pack)}
                      disabled={!isSelected && !canSelect}
                      className={`w-full aspect-square rounded-2xl border-2 transition-all flex flex-col items-center justify-center relative ${
                        isSelected
                          ? 'border-[#15803d] bg-[#15803d]/10'
                          : canSelect
                          ? 'border-gray-200 hover:border-gray-300'
                          : 'border-gray-100 opacity-40 cursor-not-allowed'
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

              {/* Selection Progress */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <p className="text-sm font-bold text-[#1a1a1a]">
                    Pasirinkta: {selectedPacks.length} / {getRequiredPacks()}
                  </p>
                  <p className={`text-xs font-medium ${
                    selectedPacks.length === getRequiredPacks() ? 'text-green-600' : 'text-gray-500'
                  }`}>
                    {selectedPacks.length === getRequiredPacks() ? '✓ Paruošta' : `Dar reikia: ${getRequiredPacks() - selectedPacks.length}`}
                  </p>
                </div>
                <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-300 rounded-full ${
                      selectedPacks.length === getRequiredPacks() ? 'bg-green-500' : 'bg-[#15803d]'
                    }`}
                    style={{ width: `${(selectedPacks.length / getRequiredPacks()) * 100}%` }}
                  />
                </div>
              </div>

              {/* Action Buttons */}
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
                  disabled={selectedPacks.length !== getRequiredPacks()}
                  className={`flex-1 py-4 rounded-xl font-bold transition-all ${
                    selectedPacks.length === getRequiredPacks()
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
              <div className="space-y-4 mb-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Vardas *</label>
                    <input
                      type="text"
                      value={billingInfo.first_name}
                      onChange={(e) => handleBillingChange('first_name', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#15803d] focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Pavardė *</label>
                    <input
                      type="text"
                      value={billingInfo.last_name}
                      onChange={(e) => handleBillingChange('last_name', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#15803d] focus:border-transparent"
                      required
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
                    required
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
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Adresas *</label>
                  <input
                    type="text"
                    value={billingInfo.address_1}
                    onChange={(e) => handleBillingChange('address_1', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#15803d] focus:border-transparent"
                    required
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
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Pašto kodas *</label>
                    <input
                      type="text"
                      value={billingInfo.postcode}
                      onChange={(e) => handleBillingChange('postcode', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#15803d] focus:border-transparent"
                      required
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

              <div className="flex gap-3">
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
                  onClick={() => handleContinue(3)}
                  className="flex-1 py-3 bg-[#15803d] text-white rounded-xl font-bold hover:bg-[#15803d]/90 transition-all"
                >
                  Tęsti
                </button>
              </div>
            </div>
          )}
        </div>

        {/* DRAWER 4: Shipping Selection */}
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
              {shippingLoading ? (
                <div className="text-center py-8">
                  <Loader className="animate-spin mx-auto mb-2" size={24} />
                  <p className="text-sm text-gray-600">Kraunami pristatymo būdai...</p>
                </div>
              ) : (
                <>
                  <div className="space-y-3 mb-6">
                    {shippingMethods.map((method) => {
                      const needsPickup = requiresPickupPoint(method.title);
                      const isSelected = selectedShipping?.id === method.id;
                      
                      return (
                        <div key={method.id}>
                          <button
                            onClick={() => {
                              setSelectedShipping(method);
                              
                              if (needsPickup) {
                                setTimeout(() => loadPickupLocations(method), 100);
                              } else {
                                setSelectedPickupPoint(null);
                                setPickupLocations([]);
                              }
                            }}
                            className={`w-full p-4 rounded-2xl border-2 transition-all text-left relative overflow-hidden ${
                              isSelected
                                ? 'border-[#15803d] bg-gradient-to-br from-green-50 to-emerald-50 shadow-md'
                                : 'border-gray-200 hover:border-gray-300 hover:shadow-sm bg-white'
                            }`}
                          >
                            {isFastestShipping(method.title) && (
                              <div className="absolute top-2 right-2 bg-[#15803d] text-white text-[10px] font-black px-2 py-1 rounded-full">
                                GREIČIAUSIAS
                              </div>
                            )}
                            
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center gap-3 flex-1">
                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                                  isSelected ? 'border-[#15803d] bg-[#15803d]' : 'border-gray-300'
                                }`}>
                                  {isSelected && <div className="w-2 h-2 bg-white rounded-full" />}
                                </div>
                                
                                {getShippingLogo(method.title) && (
                                  <img 
                                    src={getShippingLogo(method.title)!} 
                                    alt={method.title}
                                    className="h-7 object-contain flex-shrink-0"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).style.display = 'none';
                                    }}
                                  />
                                )}
                                
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-bold text-[#1a1a1a] text-base leading-tight">
                                    {getCleanShippingName(method.title)}
                                  </h4>
                                  <p className="text-sm text-gray-500 mt-0.5">
                                    {getDeliveryTime(method.title)}
                                  </p>
                                </div>
                              </div>
                              
                              <div className="text-right flex-shrink-0 ml-3">
                                <span className={`font-bold text-lg ${isSelected ? 'text-[#15803d]' : 'text-gray-900'}`}>
                                  {method.cost === 0 ? (
                                    <span className="text-green-600">Nemokamas</span>
                                  ) : (
                                    `${method.cost.toFixed(2)} €`
                                  )}
                                </span>
                              </div>
                            </div>
                            
                            {needsPickup && (
                              <div className="flex items-center gap-1.5 text-xs text-[#15803d] font-medium mt-2 ml-8">
                                <span className="text-base">📍</span>
                                <span>Pasirinkite paštomatą</span>
                              </div>
                            )}
                          </button>
                          
                          {/* Pickup Point Dropdown */}
                          {isSelected && needsPickup && (
                            <div className="mt-3 p-4 bg-gray-50 rounded-xl">
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                📍 Pasirinkite paštomatą:
                              </label>
                              
                              {loadingLocations ? (
                                <div className="flex items-center gap-2 text-gray-600 py-2">
                                  <Loader className="animate-spin" size={16} />
                                  <span className="text-sm">Kraunami paštomatai...</span>
                                </div>
                              ) : pickupLocations.length > 0 ? (
                                <>
                                  <select
                                    value={selectedPickupPoint?.id || selectedPickupPoint?.uuid || ''}
                                    onChange={(e) => {
                                      const location = pickupLocations.find(l => (l.id || l.uuid) === e.target.value);
                                      setSelectedPickupPoint(location || null);
                                    }}
                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-[#15803d] focus:outline-none transition-colors bg-white"
                                  >
                                    <option value="">-- Pasirinkite paštomatą --</option>
                                    {pickupLocations.map((location) => (
                                      <option key={location.id || location.uuid} value={location.id || location.uuid}>
                                        {location.name} - {location.address}
                                      </option>
                                    ))}
                                  </select>
                                  
                                  {selectedPickupPoint && (
                                    <div className="mt-3 p-3 bg-white rounded-lg border-2 border-[#15803d]">
                                      <p className="text-sm font-bold text-[#15803d] flex items-center gap-2">
                                        <Check size={16} />
                                        ✓ Pasirinktas paštomat as
                                      </p>
                                      <p className="text-sm text-gray-900 mt-1">{selectedPickupPoint.name}</p>
                                      <p className="text-xs text-gray-600">{selectedPickupPoint.address}</p>
                                    </div>
                                  )}
                                </>
                              ) : (
                                <>
                                  <input
                                    type="text"
                                    value={selectedPickupPoint?.name || ''}
                                    onChange={(e) => {
                                      setSelectedPickupPoint({
                                        id: 'manual',
                                        name: e.target.value,
                                        address: e.target.value,
                                      });
                                    }}
                                    placeholder="Pvz: Omniva Vilnius Akropolis, Ozo g. 25"
                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-[#15803d] focus:outline-none transition-colors"
                                  />
                                  <p className="text-xs text-gray-500 mt-2">
                                    ℹ️ Įveskite paštomato adresą rankiniu būdu
                                  </p>
                                  
                                  {selectedPickupPoint && selectedPickupPoint.name && (
                                    <div className="mt-3 p-3 bg-white rounded-lg border-2 border-[#15803d]">
                                      <p className="text-sm font-bold text-[#15803d] flex items-center gap-2">
                                        <Check size={16} />
                                        ✓ Įvestas paštomat as
                                      </p>
                                    </div>
                                  )}
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setOpenDrawer(3);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-300 transition-all"
                >
                  Atgal
                </button>
                <button
                  onClick={() => handleContinue(4)}
                  disabled={!canProceedToNextDrawer(4) || shippingLoading}
                  className={`flex-1 py-4 rounded-xl font-bold transition-all ${
                    canProceedToNextDrawer(4) && !shippingLoading
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
        <div className="bg-white rounded-2xl shadow-sm border-2 border-gray-200 overflow-hidden">
          <DrawerHeader 
            num={5} 
            title="Mokėjimas ir Patvirtinimas" 
            isOpen={openDrawer === 5}
            isCompleted={false}
            canOpen={completedDrawers.includes(4)}
          />
          
          {openDrawer === 5 && (
            <div className="p-6 border-t border-gray-200">
              
              {/* Subscription Toggle */}
              <div className="mb-6">
                <h3 className="font-bold text-[#1a1a1a] mb-3">Prenumerata</h3>
                <div className="space-y-3">
                  <div
                    onClick={() => setIsSubscription(true)}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                      isSubscription
                        ? 'border-[#15803d] bg-gradient-to-br from-[#FFF9C4] to-[#FFF59D]'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3 flex-1">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                          isSubscription ? 'border-[#15803d] bg-[#15803d]' : 'border-gray-300'
                        }`}>
                          {isSubscription && <div className="w-2 h-2 bg-white rounded-full" />}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-[#1a1a1a]">Prenumeruoti ir sutaupyti 30%</h4>
                          <p className="text-sm text-gray-600">Kas mėnesį</p>
                          <p className="text-xs text-[#15803d] font-medium mt-1">
                            🎁 Prisijunk prie Filtrų klubo ir gauk 6 populiariausius skonius kiekvieną mėnesį!
                          </p>
                        </div>
                      </div>
                      <img 
                        src="/wp-content/themes/oru-theme/dist/images/filtruklubas.png"
                        alt="Filtrų Klubas"
                        className="w-20 h-20 object-contain rounded-lg flex-shrink-0"
                        onError={(e) => {
                          console.error('Failed to load filtruklubas.png');
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                  </div>

                  <div
                    onClick={() => setIsSubscription(false)}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                      !isSubscription
                        ? 'border-[#15803d] bg-[#15803d]/5'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
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
                    <span>Įrenginys:</span>
                    <span>{formatPrice(devicePrice)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Filtrai ({selectedPacks.length} vnt.):</span>
                    <span>{formatPrice(packsTotal)}</span>
                  </div>
                  {items.length > 0 && (
                    <div className="flex justify-between">
                      <span>Krepšelio produktai:</span>
                      <span>{formatPrice(cartTotal)}</span>
                    </div>
                  )}
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
                    setOpenDrawer(4);
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
                <div className="flex items-center gap-1">
                  <Check size={14} className="text-[#15803d]" />
                  <span>SSL apsauga</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Checkout;