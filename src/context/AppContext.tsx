import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, SupplierDetails, Product, Order, CartItem, Address, Language, UserRole, ProductCategory, OrderStatus } from '../types';

interface AppContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  users: User[];
  suppliers: SupplierDetails[];
  products: Product[];
  orders: Order[];
  cart: CartItem[];
  addresses: Address[];
  selectedArea: string;
  setSelectedArea: (area: string) => void;
  
  // Auth
  login: (phone: string) => Promise<boolean>;
  signup: (name: string, phone: string, role: UserRole, area: string) => Promise<boolean>;
  logout: () => void;
  
  // Cart
  addToCart: (product: Product, quantity: number) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  
  // Orders
  placeOrder: (addressId: string, deliverySlot: string, paymentMethod: 'COD' | 'Pay on Delivery') => Promise<string | null>;
  cancelOrder: (orderId: string) => void;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  
  // Supplier / Catalog Management
  updateProductStock: (productId: string, stock: number) => void;
  updateProductPrice: (productId: string, price: number) => void;
  updateSupplierStatus: (supplierId: string, status: 'active' | 'suspended') => void;
  approveSupplier: (supplierId: string) => void;
  
  // Addresses
  addAddress: (address: Omit<Address, 'id'>) => void;
  removeAddress: (addressId: string) => void;
  
  // Users Management
  toggleUserStatus: (userId: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Initial Mock Users
const defaultUsers: User[] = [
  { id: 'u1', name: 'Rohan Deshmukh', phone: '9876543210', email: 'rohan@gmail.com', role: 'customer', isActive: true, joinedDate: '2026-01-15' },
  { id: 'u2', name: 'Amit Shinde (Pune Water Star)', phone: '8888888888', email: 'amit@punewaterstar.com', role: 'supplier', isActive: true, joinedDate: '2026-02-10' },
  { id: 'u3', name: 'Vikram Joshi (Baner Aqua)', phone: '7777777777', email: 'vikram@baneraqua.com', role: 'supplier', isActive: true, joinedDate: '2026-03-01' },
  { id: 'u4', name: 'Sunil Gaikwad (Express Water)', phone: '9999999999', email: 'sunil@expresswater.com', role: 'supplier', isActive: false, joinedDate: '2026-06-25' }, // Pending approval
  { id: 'u5', name: 'Sneha Kulkarni', phone: '9123456789', email: 'sneha@pune.gov.in', role: 'admin', isActive: true, joinedDate: '2025-12-01' },
  { id: 'u6', name: 'Pooja Patil', phone: '9822334455', email: 'pooja@gmail.com', role: 'customer', isActive: true, joinedDate: '2026-05-18' }
];

// Initial Mock Suppliers
const defaultSuppliers: SupplierDetails[] = [
  {
    id: 'u2',
    shopName: 'Pune Water Star Co.',
    areasCovered: ['Kothrud', 'Deccan Gymkhana', 'Shivajinagar'],
    rating: 4.8,
    reviewsCount: 124,
    isApproved: true,
    minOrderValue: 150,
    deliveryCharges: 20,
    status: 'active',
    imageUrl: 'https://images.unsplash.com/photo-1523362628745-0c100150b504?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 'u3',
    shopName: 'Baner Aqua Purifiers',
    areasCovered: ['Baner', 'Aundh', 'Wakad', 'Hinjewadi'],
    rating: 4.5,
    reviewsCount: 89,
    isApproved: true,
    minOrderValue: 120,
    deliveryCharges: 15,
    status: 'active',
    imageUrl: 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 'u4',
    shopName: 'Express Water Delivery',
    areasCovered: ['Hinjewadi', 'Wakad'],
    rating: 3.9,
    reviewsCount: 12,
    isApproved: false, // Needs admin approval
    minOrderValue: 200,
    deliveryCharges: 30,
    status: 'active',
    imageUrl: 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?auto=format&fit=crop&q=80&w=400'
  }
];

// Base products
const createMockProductsForSupplier = (supplierId: string): Product[] => [
  {
    id: `p-${supplierId}-jar`,
    supplierId,
    name: {
      en: '20L Drinking Water Jar',
      hi: '20L पेयजल जार',
      mr: '२०L पिण्याच्या पाण्याचा जार'
    },
    category: 'jar20l',
    price: 80,
    stock: 120,
    isAvailable: true,
    description: {
      en: 'Standard multi-use sturdy 20L water jar. Thoroughly sanitized and sealed. Ideal for homes and offices.',
      hi: 'मानक बहु-उपयोग मजबूत 20L पानी का जार। अच्छी तरह से साफ और सील किया गया। घरों और कार्यालयों के लिए आदर्श।',
      mr: 'प्रमाणित मल्टि-युझ २०L पाण्याचा जार. पूर्णपणे सॅनिटाईझ आणि सीलबंद. घर आणि ऑफिससाठी योग्य.'
    }
  },
  {
    id: `p-${supplierId}-b1l`,
    supplierId,
    name: {
      en: '1L Mineral Water Case (24 Bottles)',
      hi: '1L मिनरल वाटर केस (24 बोतलें)',
      mr: '१L मिनरल वॉटर केस (२४ बाटल्या)'
    },
    category: 'bottle1l',
    price: 240,
    stock: 50,
    isAvailable: true,
    description: {
      en: 'Pack of 24 premium mineral water bottles (1 liter each). Perfect for events, travel, and meetings.',
      hi: '24 प्रीमियम मिनरल वाटर बोतलों का पैक (प्रत्येक 1 लीटर)। कार्यक्रमों, यात्रा और बैठकों के लिए बिल्कुल सही।',
      mr: '२४ प्रीमियम मिनरल वॉटर बाटल्यांचा पॅक (प्रत्येक १ लिटर). लग्नकार्य, प्रवास आणि मीटिंगसाठी उत्तम.'
    }
  },
  {
    id: `p-${supplierId}-b2l`,
    supplierId,
    name: {
      en: '2L Premium Bottle Case (12 Bottles)',
      hi: '2L प्रीमियम बोतल केस (12 बोतलें)',
      mr: '२L प्रीमियम बाटली केस (१२ बाटल्या)'
    },
    category: 'bottle2l',
    price: 180,
    stock: 40,
    isAvailable: true,
    description: {
      en: 'Case of 12 robust 2-liter drinking water bottles. Perfect size for small family dining.',
      hi: '12 मजबूत 2-लीटर पीने के पानी की बोतलों का केस। छोटे परिवार के भोजन के लिए बिल्कुल सही आकार।',
      mr: '१२ मजबूत २-लिटर पिण्याच्या पाण्याच्या बाटल्यांचा केस. लहान कुटुंबासाठी अगदी योग्य.'
    }
  },
  {
    id: `p-${supplierId}-emergency`,
    supplierId,
    name: {
      en: 'Emergency Express Water (20L Jar)',
      hi: 'आपातकालीन एक्सप्रेस वाटर (20L जार)',
      mr: 'तात्काळ एक्सप्रेस पाणी (२०L जार)'
    },
    category: 'emergency',
    price: 130,
    stock: 25,
    isAvailable: true,
    description: {
      en: 'Guaranteed superfast delivery within 2 hours. Priority delivery team assigned immediately.',
      hi: '2 घंटे के भीतर गारंटीकृत सुपरफास्ट डिलीवरी। प्राथमिकता वितरण टीम तुरंत सौंपी गई।',
      mr: '२ तासांच्या आत हमखास सुपरफास्ट डिलिव्हरी. तत्काळ विशेष डिलिव्हरी टीमची व्यवस्था.'
    }
  }
];

const defaultProducts: Product[] = [
  ...createMockProductsForSupplier('u2'),
  ...createMockProductsForSupplier('u3'),
  ...createMockProductsForSupplier('u4')
];

// Initial Addresses
const defaultAddresses: Address[] = [
  { id: 'a1', type: 'Home', addressLine: 'Flat 402, Shivneri Apartments, Rambaug Colony', landmark: 'Near MIT College', area: 'Kothrud', pincode: '411038' },
  { id: 'a2', type: 'Office', addressLine: 'Wing B, 5th Floor, Cerebrum IT Park', landmark: 'Opposite Kalyani Kalyani Veg', area: 'Kalyani Nagar', pincode: '411006' }
];

// Initial Mock Orders
const defaultOrders: Order[] = [
  {
    id: 'ORD-9831',
    customerId: 'u1',
    customerName: 'Rohan Deshmukh',
    customerPhone: '9876543210',
    supplierId: 'u2',
    supplierName: 'Pune Water Star Co.',
    items: [
      {
        productId: 'p-u2-jar',
        quantity: 3,
        product: defaultProducts.find(p => p.id === 'p-u2-jar')!
      }
    ],
    subtotal: 240,
    deliveryCharges: 20,
    total: 260,
    status: 'delivered',
    deliveryAddress: defaultAddresses[0],
    paymentMethod: 'COD',
    deliverySlot: 'Morning (8 AM - 12 PM)',
    orderDate: '2026-06-25T10:30:00.000Z'
  },
  {
    id: 'ORD-5412',
    customerId: 'u6',
    customerName: 'Pooja Patil',
    customerPhone: '9822334455',
    supplierId: 'u3',
    supplierName: 'Baner Aqua Purifiers',
    items: [
      {
        productId: 'p-u3-b1l',
        quantity: 1,
        product: defaultProducts.find(p => p.id === 'p-u3-b1l')!
      },
      {
        productId: 'p-u3-jar',
        quantity: 2,
        product: defaultProducts.find(p => p.id === 'p-u3-jar')!
      }
    ],
    subtotal: 400,
    deliveryCharges: 15,
    total: 415,
    status: 'accepted',
    deliveryAddress: { id: 'a3', type: 'Home', addressLine: 'Flat 12, Rose Wood Society', landmark: 'Opposite DMart', area: 'Baner', pincode: '411045' },
    paymentMethod: 'Pay on Delivery',
    deliverySlot: 'Evening (4 PM - 8 PM)',
    orderDate: '2026-06-27T07:15:00.000Z'
  },
  {
    id: 'ORD-1205',
    customerId: 'u1',
    customerName: 'Rohan Deshmukh',
    customerPhone: '9876543210',
    supplierId: 'u2',
    supplierName: 'Pune Water Star Co.',
    items: [
      {
        productId: 'p-u2-emergency',
        quantity: 1,
        product: defaultProducts.find(p => p.id === 'p-u2-emergency')!
      }
    ],
    subtotal: 130,
    deliveryCharges: 20,
    total: 150,
    status: 'pending',
    deliveryAddress: defaultAddresses[0],
    paymentMethod: 'COD',
    deliverySlot: 'Emergency Express (Within 2 Hours)',
    orderDate: '2026-06-27T08:05:00.000Z'
  }
];

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Localization & Role State
  const [language, setLanguage] = useState<Language>(() => {
    return (localStorage.getItem('aquago_lang') as Language) || 'en';
  });
  
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('aquago_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [currentRole, setCurrentRole] = useState<UserRole>(() => {
    const saved = localStorage.getItem('aquago_role');
    if (saved) return saved as UserRole;
    return 'customer'; // default
  });

  // Master Lists State
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('aquago_users');
    return saved ? JSON.parse(saved) : defaultUsers;
  });

  const [suppliers, setSuppliers] = useState<SupplierDetails[]>(() => {
    const saved = localStorage.getItem('aquago_suppliers');
    return saved ? JSON.parse(saved) : defaultSuppliers;
  });

  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('aquago_products');
    return saved ? JSON.parse(saved) : defaultProducts;
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('aquago_orders');
    return saved ? JSON.parse(saved) : defaultOrders;
  });

  const [addresses, setAddresses] = useState<Address[]>(() => {
    const saved = localStorage.getItem('aquago_addresses');
    return saved ? JSON.parse(saved) : defaultAddresses;
  });

  // Client session state (Cart, location)
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('aquago_cart');
    return saved ? JSON.parse(saved) : [];
  });

  const [selectedArea, setSelectedArea] = useState<string>(() => {
    return localStorage.getItem('aquago_selected_area') || 'Kothrud';
  });

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('aquago_lang', language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem('aquago_user', currentUser ? JSON.stringify(currentUser) : '');
    if (currentUser) {
      setCurrentRole(currentUser.role);
      localStorage.setItem('aquago_role', currentUser.role);
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('aquago_role', currentRole);
  }, [currentRole]);

  useEffect(() => {
    localStorage.setItem('aquago_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('aquago_suppliers', JSON.stringify(suppliers));
  }, [suppliers]);

  useEffect(() => {
    localStorage.setItem('aquago_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('aquago_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('aquago_addresses', JSON.stringify(addresses));
  }, [addresses]);

  useEffect(() => {
    localStorage.setItem('aquago_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('aquago_selected_area', selectedArea);
  }, [selectedArea]);

  // --- Auth Actions ---
  const login = async (phone: string): Promise<boolean> => {
    // Find matching active user
    const existing = users.find(u => u.phone === phone);
    if (existing) {
      if (!existing.isActive) {
        alert('Your account has been suspended. Please contact master admin.');
        return false;
      }
      
      // If user is a supplier, ensure approved
      if (existing.role === 'supplier') {
        const sDetails = suppliers.find(s => s.id === existing.id);
        if (sDetails && !sDetails.isApproved) {
          alert('Your supplier registration is pending approval by the Admin. This takes up to 24 hours.');
          // Log them in anyway for demo, but flag it
        }
      }
      
      setCurrentUser(existing);
      setCurrentRole(existing.role);
      return true;
    }
    return false;
  };

  const signup = async (name: string, phone: string, role: UserRole, area: string): Promise<boolean> => {
    // Check if phone already registered
    if (users.some(u => u.phone === phone)) {
      alert('This mobile number is already registered.');
      return false;
    }

    const newUserId = `u-${Date.now()}`;
    const newUser: User = {
      id: newUserId,
      name,
      phone,
      role,
      isActive: true,
      joinedDate: new Date().toISOString().split('T')[0]
    };

    setUsers(prev => [...prev, newUser]);

    // If signed up as supplier, create details
    if (role === 'supplier') {
      const newSupplier: SupplierDetails = {
        id: newUserId,
        shopName: `${name} Water Suppliers`,
        areasCovered: [area],
        rating: 5.0,
        reviewsCount: 0,
        isApproved: false, // Needs Admin approval
        minOrderValue: 100,
        deliveryCharges: 15,
        status: 'active',
        imageUrl: 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?auto=format&fit=crop&q=80&w=400'
      };

      setSuppliers(prev => [...prev, newSupplier]);

      // Add base products for this supplier
      const newProds = createMockProductsForSupplier(newUserId);
      setProducts(prev => [...prev, ...newProds]);
    }

    // Auto-login after registration
    setCurrentUser(newUser);
    setCurrentRole(role);
    return true;
  };

  const logout = () => {
    setCurrentUser(null);
    setCurrentRole('customer');
    setCart([]);
  };

  // --- Cart Actions ---
  const addToCart = (product: Product, quantity: number) => {
    setCart(prev => {
      // Check if item from another supplier is already in cart
      if (prev.length > 0 && prev[0].product.supplierId !== product.supplierId) {
        if (confirm('Your cart contains items from another supplier. Do you want to clear your cart and add this item instead?')) {
          return [{ productId: product.id, quantity, product }];
        }
        return prev;
      }

      const existingIndex = prev.findIndex(item => item.productId === product.id);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += quantity;
        return updated;
      }
      return [...prev, { productId: product.id, quantity, product }];
    });
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prev =>
      prev.map(item => (item.productId === productId ? { ...item, quantity } : item))
    );
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.productId !== productId));
  };

  const clearCart = () => {
    setCart([]);
  };

  // --- Order Actions ---
  const placeOrder = async (
    addressId: string,
    deliverySlot: string,
    paymentMethod: 'COD' | 'Pay on Delivery'
  ): Promise<string | null> => {
    if (!currentUser) return null;
    if (cart.length === 0) return null;

    const address = addresses.find(a => a.id === addressId);
    if (!address) return null;

    const supplierId = cart[0].product.supplierId;
    const supplier = suppliers.find(s => s.id === supplierId);
    if (!supplier) return null;

    // Calculate subtotal
    const subtotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
    const deliveryCharges = supplier.deliveryCharges;
    const total = subtotal + deliveryCharges;

    const newOrderId = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;
    const newOrder: Order = {
      id: newOrderId,
      customerId: currentUser.id,
      customerName: currentUser.name,
      customerPhone: currentUser.phone,
      supplierId: supplier.id,
      supplierName: supplier.shopName,
      items: [...cart],
      subtotal,
      deliveryCharges,
      total,
      status: 'pending',
      deliveryAddress: address,
      paymentMethod,
      deliverySlot,
      orderDate: new Date().toISOString()
    };

    // Update product stock levels
    setProducts(prevProds =>
      prevProds.map(prod => {
        const cartItem = cart.find(item => item.productId === prod.id);
        if (cartItem) {
          return {
            ...prod,
            stock: Math.max(0, prod.stock - cartItem.quantity)
          };
        }
        return prod;
      })
    );

    // Save order
    setOrders(prev => [newOrder, ...prev]);
    setCart([]); // clear cart
    return newOrderId;
  };

  const cancelOrder = (orderId: string) => {
    setOrders(prev =>
      prev.map(order => (order.id === orderId ? { ...order, status: 'cancelled' as const } : order))
    );
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    setOrders(prev =>
      prev.map(order => (order.id === orderId ? { ...order, status } : order))
    );
  };

  // --- Supplier & Catalog Management ---
  const updateProductStock = (productId: string, stock: number) => {
    setProducts(prev =>
      prev.map(p => (p.id === productId ? { ...p, stock, isAvailable: stock > 0 } : p))
    );
  };

  const updateProductPrice = (productId: string, price: number) => {
    setProducts(prev => prev.map(p => (p.id === productId ? { ...p, price } : p)));
  };

  const updateSupplierStatus = (supplierId: string, status: 'active' | 'suspended') => {
    setSuppliers(prev =>
      prev.map(s => (s.id === supplierId ? { ...s, status } : s))
    );
  };

  const approveSupplier = (supplierId: string) => {
    setSuppliers(prev =>
      prev.map(s => (s.id === supplierId ? { ...s, isApproved: true } : s))
    );
    // Also mark them as active in main users db
    setUsers(prev =>
      prev.map(u => (u.id === supplierId ? { ...u, isActive: true } : u))
    );
  };

  // --- Address Management ---
  const addAddress = (newAddr: Omit<Address, 'id'>) => {
    const address: Address = {
      ...newAddr,
      id: `a-${Date.now()}`
    };
    setAddresses(prev => [...prev, address]);
  };

  const removeAddress = (addressId: string) => {
    setAddresses(prev => prev.filter(a => a.id !== addressId));
  };

  // --- Admin User Status Toggling ---
  const toggleUserStatus = (userId: string) => {
    setUsers(prev =>
      prev.map(u => (u.id === userId ? { ...u, isActive: !u.isActive } : u))
    );
  };

  return (
    <AppContext.Provider
      value={{
        language,
        setLanguage,
        currentUser,
        setCurrentUser,
        currentRole,
        setCurrentRole,
        users,
        suppliers,
        products,
        orders,
        cart,
        addresses,
        selectedArea,
        setSelectedArea,
        login,
        signup,
        logout,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        placeOrder,
        cancelOrder,
        updateOrderStatus,
        updateProductStock,
        updateProductPrice,
        updateSupplierStatus,
        approveSupplier,
        addAddress,
        removeAddress,
        toggleUserStatus
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
