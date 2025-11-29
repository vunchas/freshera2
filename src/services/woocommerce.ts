// Enhanced WooCommerce API service with order management

const API_BASE = '/wp-json';
const WC_API = `${API_BASE}/wc/v3`;
const ORU_API = `${API_BASE}/oru/v1`;

// Get WordPress data passed from PHP
const getWordPressData = () => {
  if (typeof window !== 'undefined' && window.oruData) {
    return window.oruData;
  }
  return {
    ajaxUrl: '/wp-admin/admin-ajax.php',
    restUrl: '/wp-json/',
    wcApiUrl: '/wp-json/wc/v3/',
    nonce: '',
    restNonce: '',
  };
};

const wpData = getWordPressData();

// API helper with authentication
const apiRequest = async (url: string, options: RequestInit = {}) => {
  const headers = {
    'Content-Type': 'application/json',
    'X-WP-Nonce': wpData.restNonce || '',
    ...options.headers,
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API Request Error:', error);
    throw error;
  }
};

// ============================================
// PRODUCT MANAGEMENT
// ============================================

export const fetchWCProducts = async () => {
  try {
    const response = await apiRequest(`${WC_API}/products?per_page=100&status=publish`);
    return response;
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
};

export const fetchProductById = async (productId: number) => {
  try {
    const response = await apiRequest(`${WC_API}/products/${productId}`);
    return response;
  } catch (error) {
    console.error('Error fetching product:', error);
    return null;
  }
};

export const fetchProductsByCategory = async (categorySlug: string) => {
  try {
    const response = await apiRequest(
      `${WC_API}/products?category=${categorySlug}&per_page=100&status=publish`
    );
    return response;
  } catch (error) {
    console.error('Error fetching products by category:', error);
    return [];
  }
};

// ============================================
// PRODUCT TRANSFORMATION
// ============================================

export const transformWCProduct = (wcProduct: any) => {
  // Get device colors from meta data
  const colorsMeta = wcProduct.meta_data?.find((m: any) => m.key === 'device_colors');
  const colors = colorsMeta?.value ? JSON.parse(colorsMeta.value) : undefined;

  // Get flavor variants from attributes
  const flavorAttr = wcProduct.attributes?.find((attr: any) => attr.name === 'Skonis' || attr.name === 'Flavor');
  const variants = flavorAttr?.options;

  // Get product images
  const images = wcProduct.images?.map((img: any) => img.src) || [];
  const mainImage = images[0] || 'https://via.placeholder.com/600';

  // Extract features from description
  const features = extractFeatures(wcProduct.description || '');

  return {
    id: `wc-${wcProduct.id}`,
    wcId: wcProduct.id,
    name: wcProduct.name,
    price: parseFloat(wcProduct.price),
    regularPrice: parseFloat(wcProduct.regular_price || wcProduct.price),
    salePrice: wcProduct.sale_price ? parseFloat(wcProduct.sale_price) : null,
    description: stripHtml(wcProduct.short_description || wcProduct.description),
    fullDescription: stripHtml(wcProduct.description),
    features: features,
    image: mainImage,
    images: images,
    category: wcProduct.categories?.[0]?.slug?.includes('rinkin') ? 'kit' : 'filter',
    categoryName: wcProduct.categories?.[0]?.name || '',
    variants: variants || undefined,
    colors: colors || undefined,
    attributes: {
      sweetness: parseInt(wcProduct.sweetness || wcProduct.meta_data?.find((m: any) => m.key === 'sweetness')?.value || '2'),
      throatHit: parseInt(wcProduct.throat_hit || wcProduct.meta_data?.find((m: any) => m.key === 'throat_hit')?.value || '2'),
    },
    stock_status: wcProduct.stock_status,
    stock_quantity: wcProduct.stock_quantity,
    in_stock: wcProduct.stock_status === 'instock',
  };
};

// Helper to strip HTML tags
const stripHtml = (html: string) => {
  const tmp = document.createElement('DIV');
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || '';
};

// Helper to extract features from description
const extractFeatures = (description: string) => {
  const features: string[] = [];
  const lines = description.split('\n');
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('-') || trimmed.startsWith('•') || trimmed.startsWith('*')) {
      features.push(trimmed.replace(/^[-•*]\s*/, '').trim());
    }
  }
  
  return features.slice(0, 5); // Return max 5 features
};

// ============================================
// ORDER CREATION
// ============================================

export interface OrderLineItem {
  product_id: number;
  quantity: number;
  meta_data?: Array<{ key: string; value: string }>;
}

export interface OrderData {
  billing: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    address_1: string;
    city: string;
    postcode: string;
    country: string;
    company?: string;
    address_2?: string;
    state?: string;
  };
  shipping?: {
    first_name: string;
    last_name: string;
    address_1: string;
    city: string;
    postcode: string;
    country: string;
    company?: string;
    address_2?: string;
    state?: string;
  };
  line_items: OrderLineItem[];
  shipping_lines?: Array<{
    method_id: string;
    method_title: string;
    total: string;
  }>;
  payment_method?: string;
  payment_method_title?: string;
  is_subscription?: boolean;
  customer_note?: string;
}

export const createOrder = async (orderData: OrderData) => {
  try {
    const response = await apiRequest(`${ORU_API}/orders`, {
      method: 'POST',
      body: JSON.stringify(orderData),
    });

    if (response.success && response.payment_url) {
      return response;
    }

    throw new Error('Failed to create order');
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
};

export const createSubscription = async (subscriptionData: OrderData) => {
  try {
    subscriptionData.is_subscription = true;
    
    const response = await apiRequest(`${ORU_API}/subscriptions`, {
      method: 'POST',
      body: JSON.stringify(subscriptionData),
    });

    if (response.success && response.payment_url) {
      return response;
    }

    throw new Error('Failed to create subscription');
  } catch (error) {
    console.error('Error creating subscription:', error);
    throw error;
  }
};

// ============================================
// ORDER STATUS CHECKING
// ============================================

export const getOrderStatus = async (orderId: number) => {
  try {
    const response = await apiRequest(`${ORU_API}/payment-status/${orderId}`);
    return response;
  } catch (error) {
    console.error('Error fetching order status:', error);
    return null;
  }
};

export const pollOrderStatus = async (
  orderId: number,
  onUpdate: (status: any) => void,
  maxAttempts: number = 30,
  interval: number = 2000
) => {
  let attempts = 0;

  const poll = async () => {
    if (attempts >= maxAttempts) {
      onUpdate({ error: 'Timeout waiting for payment confirmation' });
      return;
    }

    try {
      const status = await getOrderStatus(orderId);
      onUpdate(status);

      if (status && (status.paid || status.status === 'completed')) {
        return; // Payment successful, stop polling
      }

      if (status && (status.status === 'failed' || status.status === 'cancelled')) {
        return; // Payment failed/cancelled, stop polling
      }

      attempts++;
      setTimeout(poll, interval);
    } catch (error) {
      onUpdate({ error: 'Error checking payment status' });
    }
  };

  poll();
};

// ============================================
// CART TO ORDER CONVERSION
// ============================================

export const convertCartToOrder = (
  cartItems: any[],
  billingInfo: OrderData['billing'],
  isSubscription: boolean = false,
  customerNote: string = ''
): OrderData => {
  const lineItems: OrderLineItem[] = cartItems.map((item) => {
    const lineItem: OrderLineItem = {
      product_id: parseInt(item.wcId || item.id.replace('wc-', '')),
      quantity: item.quantity,
    };

    // Add meta data for variant and color
    const metaData: Array<{ key: string; value: string }> = [];
    
    if (item.selectedVariant) {
      metaData.push({ key: 'Skonis', value: item.selectedVariant });
    }
    
    if (item.selectedColor) {
      metaData.push({ key: 'Spalva', value: item.selectedColor });
    }

    if (metaData.length > 0) {
      lineItem.meta_data = metaData;
    }

    return lineItem;
  });

  return {
    billing: billingInfo,
    line_items: lineItems,
    is_subscription: isSubscription,
    customer_note: customerNote,
  };
};

// ============================================
// FORM VALIDATION
// ============================================

export const validateBillingInfo = (billing: OrderData['billing']): string[] => {
  const errors: string[] = [];

  if (!billing.first_name || billing.first_name.trim().length < 2) {
    errors.push('Vardas turi būti bent 2 simboliai');
  }

  if (!billing.last_name || billing.last_name.trim().length < 2) {
    errors.push('Pavardė turi būti bent 2 simboliai');
  }

  if (!billing.email || !isValidEmail(billing.email)) {
    errors.push('Neteisingas el. pašto adresas');
  }

  if (!billing.phone || billing.phone.trim().length < 9) {
    errors.push('Neteisingas telefono numeris');
  }

  if (!billing.address_1 || billing.address_1.trim().length < 5) {
    errors.push('Adresas turi būti bent 5 simboliai');
  }

  if (!billing.city || billing.city.trim().length < 2) {
    errors.push('Miestas turi būti bent 2 simboliai');
  }

  if (!billing.postcode || billing.postcode.trim().length < 5) {
    errors.push('Neteisingas pašto kodas');
  }

  if (!billing.country) {
    errors.push('Pasirinkite šalį');
  }

  return errors;
};

const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// ============================================
// PRICE CALCULATIONS
// ============================================

export const calculateTotal = (items: any[]): number => {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
};

export const calculateSubscriptionDiscount = (total: number): number => {
  return total * 0.30; // 30% discount
};

export const calculateShipping = (total: number, country: string = 'LT'): number => {
  if (total >= 40) return 0; // Free shipping over 40€
  if (country === 'LT') return 2.99;
  return 5.99; // International shipping
};

export const formatPrice = (price: number, currency: string = 'EUR'): string => {
  return new Intl.NumberFormat('lt-LT', {
    style: 'currency',
    currency: currency,
  }).format(price);
};

// ============================================
// DEVICE COLORS
// ============================================

export const DEVICE_COLORS = [
  { name: 'Sidabras + Šviesus Ąžuolas', metalColor: '#E5E7EB', woodColor: '#D4B996' },
  { name: 'Plienas + Vidutinis Medis', metalColor: '#4B5563', woodColor: '#8D6E63' },
  { name: 'Juoda + Tamsus Riešutas', metalColor: '#1F2937', woodColor: '#3E2723' }
];

export default {
  fetchWCProducts,
  fetchProductById,
  fetchProductsByCategory,
  transformWCProduct,
  createOrder,
  createSubscription,
  getOrderStatus,
  pollOrderStatus,
  convertCartToOrder,
  validateBillingInfo,
  calculateTotal,
  calculateSubscriptionDiscount,
  calculateShipping,
  formatPrice,
  DEVICE_COLORS,
};