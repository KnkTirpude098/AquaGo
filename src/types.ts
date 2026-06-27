export type Language = 'en' | 'hi' | 'mr';

export type UserRole = 'customer' | 'supplier' | 'admin';

export interface User {
  id: string;
  name: string;
  phone: string;
  email?: string;
  role: UserRole;
  isActive: boolean;
  joinedDate: string;
}

export interface SupplierDetails {
  id: string; // matches User.id
  shopName: string;
  areasCovered: string[]; // e.g. ["Kothrud", "Baner", "Hinjewadi"]
  rating: number;
  reviewsCount: number;
  isApproved: boolean;
  minOrderValue: number;
  deliveryCharges: number;
  status: 'active' | 'suspended';
  imageUrl: string;
}

export type ProductCategory = 'jar20l' | 'bottle1l' | 'bottle2l' | 'emergency';

export interface Product {
  id: string;
  supplierId: string;
  name: {
    en: string;
    hi: string;
    mr: string;
  };
  category: ProductCategory;
  price: number;
  stock: number;
  isAvailable: boolean;
  description: {
    en: string;
    hi: string;
    mr: string;
  };
}

export interface CartItem {
  productId: string;
  quantity: number;
  // Included directly for convenience in cart display
  product: Product;
}

export interface Address {
  id: string;
  type: 'Home' | 'Office' | 'Other';
  addressLine: string;
  landmark: string;
  area: string; // Selected from standard Pune areas list
  pincode: string;
}

export type OrderStatus = 'pending' | 'accepted' | 'out_for_delivery' | 'delivered' | 'cancelled';

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  supplierId: string;
  supplierName: string;
  items: CartItem[];
  subtotal: number;
  deliveryCharges: number;
  total: number;
  status: OrderStatus;
  deliveryAddress: Address;
  paymentMethod: 'COD' | 'Pay on Delivery';
  deliverySlot: string; // e.g. "Morning (8 AM - 12 PM)" or "Immediate"
  orderDate: string;
}

export interface Area {
  name: string;
  pincode: string;
}

export const PUNE_AREAS: Area[] = [
  { name: 'Kothrud', pincode: '411038' },
  { name: 'Baner', pincode: '411045' },
  { name: 'Hinjewadi', pincode: '411057' },
  { name: 'Wakad', pincode: '411057' },
  { name: 'Viman Nagar', pincode: '411014' },
  { name: 'Kalyani Nagar', pincode: '411006' },
  { name: 'Hadapsar', pincode: '411028' },
  { name: 'Shivajinagar', pincode: '411005' },
  { name: 'Aundh', pincode: '411007' },
  { name: 'Deccan Gymkhana', pincode: '411004' }
];
