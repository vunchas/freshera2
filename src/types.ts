export interface ProductColor {
  name: string;
  metalColor: string;
  woodColor: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  features: string[];
  image: string;
  category: 'kit' | 'filter';
  variants?: string[]; // e.g., ["Mėta", "Citrus", "Mix"]
  colors?: ProductColor[];
  attributes?: {
    sweetness: number; // 1-3
    throatHit: number; // 1-3
  };
}

export interface CartItem extends Product {
  quantity: number;
  selectedVariant?: string;
  selectedColor?: string;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface NavItem {
  label: string;
  href: string;
}