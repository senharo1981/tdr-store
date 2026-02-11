
export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  unit: string;
  image: string;
  inStock: boolean;
  isFeatured?: boolean;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Category {
  en: string;
  ur: string;
}

export interface CustomerInfo {
  name: string;
  phone: string;
  address: string;
  location: { lat: number; lng: number } | null;
}
