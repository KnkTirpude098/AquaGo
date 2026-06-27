import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { translations } from '../translations';
import { Product, SupplierDetails, Address, PUNE_AREAS, ProductCategory } from '../types';
import { 
  Search, MapPin, Star, Truck, AlertTriangle, Plus, Minus, ShoppingCart, 
  Trash2, Home, Building, MoreHorizontal, CheckCircle2, Clock, 
  CreditCard, User as UserIcon, Calendar, ArrowRight, X, ChevronRight, Check, Store
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CustomerPortalProps {
  activeView: string;
  onNavigate: (view: string) => void;
}

export const CustomerPortal: React.FC<CustomerPortalProps> = ({ activeView, onNavigate }) => {
  const {
    language,
    currentUser,
    suppliers,
    products,
    orders,
    cart,
    addresses,
    selectedArea,
    setSelectedArea,
    addToCart,
    updateCartQuantity,
    removeFromCart,
    placeOrder,
    cancelOrder,
    addAddress,
    removeAddress
  } = useApp();

  const t = translations[language];

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | 'all'>('all');
  const [selectedSupplier, setSelectedSupplier] = useState<SupplierDetails | null>(null);

  // Address Modal / Adding state
  const [showAddAddressModal, setShowAddAddressModal] = useState(false);
  const [newAddrType, setNewAddrType] = useState<'Home' | 'Office' | 'Other'>('Home');
  const [newAddrLine, setNewAddrLine] = useState('');
  const [newAddrLandmark, setNewAddrLandmark] = useState('');
  const [newAddrArea, setNewAddrArea] = useState('Kothrud');
  const [newAddrPincode, setNewAddrPincode] = useState('411038');

  // Checkout flows
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [deliverySlot, setDeliverySlot] = useState('Morning (8 AM - 12 PM)');
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'Pay on Delivery'>('COD');
  const [placedOrderId, setPlacedOrderId] = useState<string | null>(null);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  // Profile Edit
  const [profileName, setProfileName] = useState(currentUser?.name || '');
  const [profileEmail, setProfileEmail] = useState(currentUser?.email || '');
  const [profileSavedMsg, setProfileSavedMsg] = useState(false);

  // --- Filtering Logic ---
  // Get suppliers that cover the selected Pune area
  const areaSuppliers = suppliers.filter(
    (s) => s.areasCovered.includes(selectedArea) && s.isApproved && s.status === 'active'
  );

  const handleAreaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const areaName = e.target.value;
    setSelectedArea(areaName);
    setSelectedSupplier(null); // Reset selected supplier when area shifts
  };

  // Get products of the current suppliers covering this area
  const activeSupplierIds = areaSuppliers.map((s) => s.id);
  const availableProducts = products.filter(
    (p) => activeSupplierIds.includes(p.supplierId) && p.isAvailable && p.stock > 0
  );

  // Filter products by search and category
  const filteredProducts = availableProducts.filter((p) => {
    const matchesSearch = p.name[language].toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
    const matchesSupplier = !selectedSupplier || p.supplierId === selectedSupplier.id;
    return matchesSearch && matchesCategory && matchesSupplier;
  });

  // Calculations for cart
  const subtotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const activeSupplier = cart.length > 0 ? suppliers.find((s) => s.id === cart[0].product.supplierId) : null;
  const deliveryCharges = activeSupplier ? activeSupplier.deliveryCharges : 0;
  const cartTotal = subtotal + deliveryCharges;

  // Initializing selected address on checkout open
  React.useEffect(() => {
    if (addresses.length > 0 && !selectedAddressId) {
      setSelectedAddressId(addresses[0].id);
    }
  }, [addresses, selectedAddressId]);

  // Handle address submit
  const handleAddAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddrLine) return;
    
    addAddress({
      type: newAddrType,
      addressLine: newAddrLine,
      landmark: newAddrLandmark,
      area: newAddrArea,
      pincode: newAddrPincode
    });

    // Reset Form
    setNewAddrLine('');
    setNewAddrLandmark('');
    setShowAddAddressModal(false);
  };

  const handlePlaceOrderSubmit = async () => {
    if (!selectedAddressId) {
      alert(language === 'mr' ? 'कृपया डिलिव्हरीचा पत्ता निवडा' : language === 'hi' ? 'कृपया वितरण का पता चुनें' : 'Please select a delivery address');
      return;
    }
    setIsPlacingOrder(true);
    const orderId = await placeOrder(selectedAddressId, deliverySlot, paymentMethod);
    setIsPlacingOrder(false);
    if (orderId) {
      setPlacedOrderId(orderId);
    }
  };

  const saveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentUser) {
      currentUser.name = profileName;
      currentUser.email = profileEmail;
      setProfileSavedMsg(true);
      setTimeout(() => setProfileSavedMsg(false), 2000);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-6" id="customer-portal">
      
      {/* ----------------- HOME VIEW ----------------- */}
      {activeView === 'home' && (
        <div className="space-y-6">
          
          {/* Hero Banner with Location Selection */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-blue-500/10 flex flex-col md:flex-row items-center justify-between gap-6" id="customer-hero">
            <div className="space-y-4 max-w-xl text-center md:text-left">
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-white/20 text-white backdrop-blur-md">
                📍 {t.deliveringTo} Pune
              </span>
              <h1 className="text-3xl sm:text-4xl font-display font-extrabold tracking-tight">
                {t.slogan}
              </h1>
              <p className="text-blue-100 text-sm sm:text-base font-medium">
                Choose from verified water suppliers with automated slot delivery and real-time tracking.
              </p>
              
              {/* Pune Area Selector */}
              <div className="inline-flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-white p-2 rounded-2xl shadow-lg w-full max-w-md">
                <div className="flex items-center px-3 py-2 text-gray-500 flex-1 border-r border-gray-100">
                  <MapPin className="h-5 w-5 text-blue-600 mr-2 shrink-0 animate-bounce" />
                  <select 
                    value={selectedArea}
                    onChange={handleAreaChange}
                    className="bg-transparent text-gray-800 font-semibold text-sm w-full focus:outline-none appearance-none cursor-pointer"
                  >
                    {PUNE_AREAS.map((a) => (
                      <option key={a.name} value={a.name}>
                        {a.name} ({a.pincode})
                      </option>
                    ))}
                  </select>
                </div>
                <button className="bg-blue-600 text-white font-bold text-sm px-5 py-2.5 rounded-xl transition-all cursor-pointer">
                  Search
                </button>
              </div>
            </div>

            {/* Illustration Container */}
            <div className="hidden md:flex justify-center items-center h-48 w-48 relative">
              <div className="absolute inset-0 bg-white/10 rounded-full animate-ping pointer-events-none" />
              <div className="bg-white/15 backdrop-blur-md p-6 rounded-full border border-white/20">
                <Truck className="h-24 w-24 text-blue-100" />
              </div>
            </div>
          </div>

          {/* Quick Category Icons */}
          <div className="space-y-3">
            <h3 className="text-lg font-display font-bold text-gray-800">
              {t.browseByProducts}
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {(['jar20l', 'bottle1l', 'bottle2l', 'emergency'] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(selectedCategory === cat ? 'all' : cat)}
                  className={`flex flex-col items-center justify-center p-4 rounded-2xl border text-center transition-all ${
                    selectedCategory === cat
                      ? 'border-blue-600 bg-blue-50/40 text-blue-900 shadow-md shadow-blue-500/5 font-semibold'
                      : 'border-gray-100 hover:border-blue-200 hover:bg-blue-50/10 bg-white text-gray-600'
                  }`}
                >
                  <div className={`p-2.5 rounded-xl mb-2 ${selectedCategory === cat ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-600'}`}>
                    {cat === 'jar20l' && <span className="text-xl font-bold font-sans">20L</span>}
                    {cat === 'bottle1l' && <span className="text-xl font-bold font-sans">1L</span>}
                    {cat === 'bottle2l' && <span className="text-xl font-bold font-sans">2L</span>}
                    {cat === 'emergency' && <AlertTriangle className="h-5 w-5 animate-pulse" />}
                  </div>
                  <span className="text-sm font-semibold tracking-tight">
                    {t[cat]}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Emergency Water Banner */}
          <div 
            onClick={() => setSelectedCategory('emergency')}
            className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between cursor-pointer hover:bg-amber-100/50 transition-colors"
          >
            <div className="flex items-center space-x-3 text-amber-900">
              <AlertTriangle className="h-6 w-6 text-amber-600 animate-pulse shrink-0" />
              <div>
                <h4 className="font-bold text-sm">{t.emergencyBanner}</h4>
                <p className="text-xs text-amber-700 font-medium">Priority delivery team dispatched instantly upon order placement.</p>
              </div>
            </div>
            <ArrowRight className="h-5 w-5 text-amber-600 hidden sm:block shrink-0" />
          </div>

          {/* Core Supplier & Product List */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-2">
            
            {/* Suppliers near you */}
            <div className="lg:col-span-4 space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <h3 className="font-display font-bold text-lg text-gray-900">
                  {t.suppliersNearYou} <span className="text-blue-600">{selectedArea}</span>
                </h3>
                <span className="bg-blue-50 text-blue-600 text-xs font-bold px-2 py-0.5 rounded-full">
                  {areaSuppliers.length} Listed
                </span>
              </div>

              {areaSuppliers.length === 0 ? (
                <div className="p-8 text-center bg-gray-50 border border-gray-100 rounded-2xl text-gray-400 font-medium">
                  No suppliers delivering in {selectedArea} right now. Please check nearby areas!
                </div>
              ) : (
                <div className="space-y-3">
                  {areaSuppliers.map((sup) => (
                    <div
                      key={sup.id}
                      onClick={() => setSelectedSupplier(selectedSupplier?.id === sup.id ? null : sup)}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center space-x-4 ${
                        selectedSupplier?.id === sup.id
                          ? 'border-blue-500 bg-blue-50/30 shadow-md'
                          : 'border-gray-150 bg-white hover:border-blue-200 hover:shadow-sm'
                      }`}
                    >
                      <img 
                        src={sup.imageUrl} 
                        alt={sup.shopName} 
                        className="h-14 w-14 rounded-xl object-cover shrink-0 border border-gray-100"
                        referrerPolicy="no-referrer"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-sm text-gray-900 truncate">{sup.shopName}</h4>
                        <div className="flex items-center text-xs text-gray-500 mt-1 space-x-2 font-medium">
                          <span className="flex items-center text-amber-500">
                            <Star className="h-3.5 w-3.5 fill-current mr-0.5" />
                            {sup.rating.toFixed(1)}
                          </span>
                          <span>•</span>
                          <span>{t.minOrder}: ₹{sup.minOrderValue}</span>
                        </div>
                        <div className="text-[10px] text-gray-400 mt-1 font-semibold tracking-wider uppercase">
                          🛵 Delivery: ₹{sup.deliveryCharges}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Products grid */}
            <div className="lg:col-span-8 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-3">
                <h3 className="font-display font-bold text-lg text-gray-900">
                  {selectedSupplier ? `${selectedSupplier.shopName} - Menu` : t.allProducts}
                </h3>
                
                {/* Search in Menu */}
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t.searchSuppliers}
                    className="w-full pl-9 pr-4 py-1.5 bg-gray-50 border border-gray-100 focus:border-blue-500 focus:bg-white text-xs font-semibold rounded-xl focus:outline-none transition-all"
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {filteredProducts.length === 0 ? (
                <div className="p-12 text-center bg-gray-50 border border-gray-100 rounded-2xl text-gray-400 font-medium">
                  No products available matching your search criteria.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {filteredProducts.map((p) => {
                    const sup = suppliers.find((s) => s.id === p.supplierId);
                    return (
                      <motion.div
                        layout
                        key={p.id}
                        className="bg-white border border-gray-100 rounded-2xl p-4 flex flex-col justify-between hover:shadow-md transition-all"
                      >
                        <div>
                          <div className="flex items-start justify-between">
                            <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              p.category === 'emergency' 
                                ? 'bg-amber-100 text-amber-800' 
                                : 'bg-blue-50 text-blue-800'
                            }`}>
                              {t[p.category]}
                            </span>
                            <span className="text-xs text-gray-400 font-medium">Stock: {p.stock}</span>
                          </div>

                          <h4 className="font-bold text-gray-800 mt-2 font-display text-base">
                            {p.name[language]}
                          </h4>
                          
                          <p className="text-xs text-gray-400 mt-1 font-medium line-clamp-2">
                            {p.description[language]}
                          </p>

                          <div className="mt-2 text-xs font-semibold text-blue-600 flex items-center">
                            <Store className="h-3.5 w-3.5 mr-1" />
                            {sup?.shopName}
                          </div>
                        </div>

                        <div className="mt-4 pt-3 border-t border-gray-50 flex items-center justify-between">
                          <div>
                            <span className="text-lg font-sans font-extrabold text-blue-900">₹{p.price}</span>
                          </div>
                          
                          <button
                            onClick={() => {
                              addToCart(p, 1);
                              alert(t.itemsAdded);
                            }}
                            className="flex items-center space-x-1 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-500/10 transition-colors"
                          >
                            <Plus className="h-3.5 w-3.5" />
                            <span>{t.addToCart}</span>
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* ----------------- CART VIEW ----------------- */}
      {activeView === 'cart' && (
        <div className="space-y-6">
          <h2 className="text-2xl font-display font-bold text-gray-800">{t.cartTitle}</h2>

          {cart.length === 0 ? (
            <div className="text-center p-12 bg-white border border-gray-150 rounded-3xl max-w-lg mx-auto space-y-4">
              <div className="p-4 bg-blue-50 rounded-full inline-block">
                <ShoppingCart className="h-10 w-10 text-blue-500" />
              </div>
              <h3 className="font-bold text-lg text-gray-700">{t.cartEmpty}</h3>
              <button
                onClick={() => onNavigate('home')}
                className="px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl text-sm transition-colors cursor-pointer"
              >
                {t.continueShopping}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Cart List */}
              <div className="lg:col-span-8 space-y-4">
                <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-2xl flex items-center space-x-2 text-xs font-semibold text-blue-800">
                  <Store className="h-4 w-4 text-blue-600" />
                  <span>Ordering from: <strong>{activeSupplier?.shopName}</strong></span>
                </div>

                <div className="bg-white border border-gray-150 rounded-3xl divide-y divide-gray-100 overflow-hidden">
                  {cart.map((item) => (
                    <div key={item.productId} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-start space-x-4">
                        <div className="p-3 bg-blue-50 rounded-2xl text-blue-600 font-bold text-center shrink-0">
                          {item.product.category === 'jar20l' ? '20L' : 'CASE'}
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-800 text-sm sm:text-base">{item.product.name[language]}</h4>
                          <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{item.product.description[language]}</p>
                          <span className="text-sm font-extrabold text-blue-900 mt-1 inline-block">₹{item.product.price} / Piece</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end space-x-4 border-t sm:border-0 pt-3 sm:pt-0">
                        <div className="flex items-center bg-gray-50 p-1 rounded-xl border border-gray-150">
                          <button
                            onClick={() => updateCartQuantity(item.productId, item.quantity - 1)}
                            className="p-1 hover:bg-white rounded-lg transition-colors text-gray-500 hover:text-gray-900"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="font-sans font-bold text-sm px-3 w-8 text-center text-gray-800">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateCartQuantity(item.productId, item.quantity + 1)}
                            className="p-1 hover:bg-white rounded-lg transition-colors text-gray-500 hover:text-gray-900"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>

                        <div className="flex items-center space-x-4">
                          <span className="font-sans font-extrabold text-base text-blue-950 w-20 text-right">
                            ₹{item.product.price * item.quantity}
                          </span>
                          <button
                            onClick={() => removeFromCart(item.productId)}
                            className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl transition-colors"
                          >
                            <Trash2 className="h-4.5 w-4.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Checkout Form */}
              <div className="lg:col-span-4 space-y-6">
                
                {/* Order Summary Receipt */}
                <div className="bg-white border border-gray-150 shadow-sm rounded-3xl p-6 space-y-4">
                  <h3 className="font-display font-bold text-lg text-gray-800 border-b border-gray-100 pb-3">Bill Details</h3>
                  
                  <div className="space-y-2.5 text-sm font-medium">
                    <div className="flex justify-between text-gray-500">
                      <span>{t.subtotal}</span>
                      <span className="text-gray-800">₹{subtotal}</span>
                    </div>
                    <div className="flex justify-between text-gray-500">
                      <span>{t.deliveryCharge}</span>
                      <span className="text-gray-800">₹{deliveryCharges}</span>
                    </div>
                    
                    <div className="border-t border-gray-100 pt-3 flex justify-between text-base font-extrabold text-blue-900">
                      <span>Total Pay</span>
                      <span>₹{cartTotal}</span>
                    </div>
                  </div>

                  {/* Sub-threshold check for supplier minimum order */}
                  {activeSupplier && subtotal < activeSupplier.minOrderValue && (
                    <div className="p-3 bg-red-50 border border-red-100 text-xs font-semibold text-red-700 rounded-xl flex items-start space-x-1.5">
                      <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                      <span>Minimum order value for {activeSupplier.shopName} is ₹{activeSupplier.minOrderValue}. Add items worth ₹{activeSupplier.minOrderValue - subtotal} more to checkout!</span>
                    </div>
                  )}

                  <button
                    disabled={activeSupplier ? subtotal < activeSupplier.minOrderValue : true}
                    onClick={() => {
                      if (addresses.length === 0) {
                        setShowAddAddressModal(true);
                      } else {
                        onNavigate('checkout');
                      }
                    }}
                    className="w-full flex items-center justify-center space-x-2 py-3.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold rounded-xl shadow-md shadow-blue-500/10 transition-colors cursor-pointer"
                  >
                    <span>{t.checkout}</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>

              </div>
            </div>
          )}
        </div>
      )}

      {/* ----------------- CHECKOUT FLOW VIEW ----------------- */}
      {activeView === 'checkout' && (
        <div className="space-y-6">
          <h2 className="text-2xl font-display font-bold text-gray-800">{t.checkout}</h2>

          {placedOrderId ? (
            <div className="text-center p-12 bg-white border border-blue-50 shadow-xl rounded-3xl max-w-lg mx-auto space-y-4">
              <div className="p-4 bg-green-50 text-green-600 rounded-full inline-block animate-bounce">
                <CheckCircle2 className="h-12 w-12" />
              </div>
              <h3 className="font-extrabold text-2xl text-blue-900">{t.orderSuccess}</h3>
              <p className="text-sm text-gray-500 font-medium">{t.orderSuccessDesc}</p>
              
              <div className="p-4 bg-gray-50 rounded-2xl font-mono text-sm inline-block font-semibold">
                {t.orderId}: <span className="text-blue-600">{placedOrderId}</span>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
                <button
                  onClick={() => {
                    setPlacedOrderId(null);
                    onNavigate('orders');
                  }}
                  className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white font-bold rounded-xl text-sm transition-colors cursor-pointer"
                >
                  {t.viewMyOrders}
                </button>
                <button
                  onClick={() => {
                    setPlacedOrderId(null);
                    onNavigate('home');
                  }}
                  className="w-full sm:w-auto px-6 py-3 bg-gray-100 text-gray-600 font-bold rounded-xl text-sm transition-colors cursor-pointer"
                >
                  {t.continueShopping}
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Form entries */}
              <div className="lg:col-span-8 space-y-6">
                
                {/* 1. Address Section */}
                <div className="bg-white border border-gray-150 rounded-3xl p-6 space-y-4">
                  <div className="flex items-center justify-between border-b border-gray-50 pb-3">
                    <h3 className="font-display font-bold text-lg text-gray-800 flex items-center">
                      <MapPin className="h-5 w-5 text-blue-600 mr-2" />
                      {t.selectAddress}
                    </h3>
                    <button
                      onClick={() => setShowAddAddressModal(true)}
                      className="text-xs text-blue-600 hover:text-blue-700 font-bold flex items-center"
                    >
                      <Plus className="h-3.5 w-3.5 mr-1" />
                      {t.addNewAddress}
                    </button>
                  </div>

                  {addresses.length === 0 ? (
                    <div className="text-center py-6 text-gray-400 text-sm font-medium">
                      No saved addresses. Please click Add New Address above to set up.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {addresses.map((addr) => (
                        <div
                          key={addr.id}
                          onClick={() => setSelectedAddressId(addr.id)}
                          className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start space-x-3 ${
                            selectedAddressId === addr.id
                              ? 'border-blue-500 bg-blue-50/20'
                              : 'border-gray-150 hover:border-blue-100 bg-white'
                          }`}
                        >
                          <div className={`p-2 rounded-xl mt-0.5 ${selectedAddressId === addr.id ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-600'}`}>
                            {addr.type === 'Home' ? <Home className="h-4.5 w-4.5" /> : <Building className="h-4.5 w-4.5" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="text-xs font-bold text-gray-800 tracking-wide uppercase">{addr.type}</span>
                            <p className="text-xs text-gray-500 font-medium line-clamp-2 mt-1">{addr.addressLine}</p>
                            <p className="text-[10px] text-gray-400 font-semibold mt-1">Landmark: {addr.landmark}</p>
                            <span className="inline-flex items-center text-[10px] font-bold text-blue-600 mt-1.5">
                              {addr.area} ({addr.pincode})
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 2. Slot Selection */}
                <div className="bg-white border border-gray-150 rounded-3xl p-6 space-y-4">
                  <h3 className="font-display font-bold text-lg text-gray-800 flex items-center border-b border-gray-50 pb-3">
                    <Clock className="h-5 w-5 text-blue-600 mr-2" />
                    {t.deliverySlot}
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      { key: 'slotMorning', label: t.slotMorning, icon: Clock },
                      { key: 'slotAfternoon', label: t.slotAfternoon, icon: Clock },
                      { key: 'slotEvening', label: t.slotEvening, icon: Clock },
                      { key: 'slotExpress', label: t.slotExpress, icon: AlertTriangle, color: 'text-amber-600 bg-amber-50 border-amber-100' }
                    ].map((slot) => {
                      const Icon = slot.icon;
                      const isSelected = deliverySlot === slot.label;
                      return (
                        <div
                          key={slot.key}
                          onClick={() => setDeliverySlot(slot.label)}
                          className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center space-x-3 ${
                            isSelected
                              ? 'border-blue-500 bg-blue-50/20'
                              : 'border-gray-150 hover:border-blue-100 bg-white'
                          }`}
                        >
                          <div className={`p-2 rounded-xl ${isSelected ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-600'}`}>
                            <Icon className="h-4.5 w-4.5" />
                          </div>
                          <span className="text-sm font-semibold text-gray-800">{slot.label}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Payment Method */}
                <div className="bg-white border border-gray-150 rounded-3xl p-6 space-y-4">
                  <h3 className="font-display font-bold text-lg text-gray-800 flex items-center border-b border-gray-50 pb-3">
                    <CreditCard className="h-5 w-5 text-blue-600 mr-2" />
                    {t.paymentMethod}
                  </h3>

                  <div className="p-4 rounded-2xl border border-blue-500 bg-blue-50/20 flex items-center space-x-3">
                    <div className="p-2.5 bg-blue-600 text-white rounded-xl">
                      <Check className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-gray-800">{t.cod}</h4>
                      <p className="text-xs text-gray-500 mt-0.5">Pay at your doorstep via Cash, UPI, or QR code upon delivery.</p>
                    </div>
                  </div>
                </div>

              </div>

              {/* Order total receipt side */}
              <div className="lg:col-span-4 space-y-4">
                <div className="bg-white border border-gray-150 shadow-sm rounded-3xl p-6 space-y-4">
                  <h3 className="font-display font-bold text-lg text-gray-800 border-b border-gray-100 pb-3">Checkout Receipt</h3>

                  <div className="space-y-3.5 text-sm font-semibold">
                    <div className="flex justify-between text-gray-500">
                      <span>Subtotal</span>
                      <span className="text-gray-800">₹{subtotal}</span>
                    </div>
                    <div className="flex justify-between text-gray-500">
                      <span>Delivery charge</span>
                      <span className="text-gray-800">₹{deliveryCharges}</span>
                    </div>
                    <div className="border-t border-gray-100 pt-3 flex justify-between text-base font-extrabold text-blue-900">
                      <span>Total Amount</span>
                      <span>₹{cartTotal}</span>
                    </div>
                  </div>

                  <button
                    disabled={isPlacingOrder || addresses.length === 0}
                    onClick={handlePlaceOrderSubmit}
                    className="w-full flex items-center justify-center space-x-2 py-3.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 text-white font-semibold rounded-xl shadow-md shadow-blue-500/10 transition-colors cursor-pointer"
                  >
                    <span>{isPlacingOrder ? '...' : t.placeOrder}</span>
                    <ChevronRight className="h-4.5 w-4.5" />
                  </button>
                </div>
              </div>

            </div>
          )}
        </div>
      )}

      {/* ----------------- MY ORDERS HISTORY VIEW ----------------- */}
      {activeView === 'orders' && (
        <div className="space-y-6">
          <h2 className="text-2xl font-display font-bold text-gray-800">{t.myOrders}</h2>

          {orders.filter((o) => o.customerId === currentUser?.id).length === 0 ? (
            <div className="text-center p-12 bg-white border border-gray-150 rounded-3xl max-w-lg mx-auto space-y-4">
              <div className="p-4 bg-blue-50 rounded-full inline-block">
                <Clock className="h-10 w-10 text-blue-500" />
              </div>
              <h3 className="font-bold text-lg text-gray-700">{t.noOrders}</h3>
              <button
                onClick={() => onNavigate('home')}
                className="px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl text-sm cursor-pointer"
              >
                Order Water Now
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {orders
                .filter((o) => o.customerId === currentUser?.id)
                .map((order) => {
                  const isPending = order.status === 'pending';
                  
                  // Color codes for statuses
                  const statusColors: Record<string, { bg: string; text: string; label: string }> = {
                    pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: t.statusPending },
                    accepted: { bg: 'bg-blue-100', text: 'text-blue-800', label: t.statusAccepted },
                    out_for_delivery: { bg: 'bg-purple-100', text: 'text-purple-800', label: t.statusOutForDelivery },
                    delivered: { bg: 'bg-green-100', text: 'text-green-800', label: t.statusDelivered },
                    cancelled: { bg: 'bg-red-100', text: 'text-red-800', label: t.statusCancelled }
                  };

                  const currentStatus = statusColors[order.status] || { bg: 'bg-gray-100', text: 'text-gray-800', label: order.status };

                  return (
                    <div key={order.id} className="bg-white border border-gray-150 rounded-3xl p-6 shadow-sm space-y-4">
                      
                      {/* Top Order Meta */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-50 pb-3.5 gap-2">
                        <div>
                          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Order ID</span>
                          <h4 className="font-mono text-sm font-bold text-blue-900">{order.id}</h4>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-gray-400 font-medium">{new Date(order.orderDate).toLocaleString()}</span>
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${currentStatus.bg} ${currentStatus.text}`}>
                            {currentStatus.label}
                          </span>
                        </div>
                      </div>

                      {/* Items Ordered list */}
                      <div className="space-y-2">
                        {order.items.map((item) => (
                          <div key={item.productId} className="flex justify-between items-center text-sm font-medium">
                            <span className="text-gray-700">
                              {item.product.name[language]} <strong className="text-blue-600">x{item.quantity}</strong>
                            </span>
                            <span className="text-gray-900">₹{item.product.price * item.quantity}</span>
                          </div>
                        ))}
                      </div>

                      {/* Summary, address, actions */}
                      <div className="grid grid-cols-1 md:grid-cols-2 pt-4 border-t border-gray-50 gap-4">
                        <div className="text-xs space-y-1 text-gray-500 font-medium">
                          <div>
                            <strong className="text-gray-700">Supplier:</strong> {order.supplierName}
                          </div>
                          <div>
                            <strong className="text-gray-700">Address:</strong> {order.deliveryAddress.addressLine}, {order.deliveryAddress.landmark}, {order.deliveryAddress.area} ({order.deliveryAddress.pincode})
                          </div>
                          <div>
                            <strong className="text-gray-700">Slot Chosen:</strong> {order.deliverySlot}
                          </div>
                        </div>

                        <div className="flex flex-col justify-end items-stretch sm:items-end gap-3">
                          <div className="text-sm font-semibold">
                            <span className="text-gray-500">Total Charged: </span>
                            <span className="text-lg font-sans font-extrabold text-blue-950">₹{order.total}</span>
                          </div>

                          <div className="flex items-center space-x-2">
                            {isPending && (
                              <button
                                onClick={() => {
                                  if (confirm('Are you sure you want to cancel this order?')) {
                                    cancelOrder(order.id);
                                  }
                                }}
                                className="px-4 py-2 border border-red-200 hover:bg-red-50 text-red-600 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                              >
                                {t.cancelOrder}
                              </button>
                            )}
                            <button
                              onClick={() => alert(`Connecting you to the water delivery agent of ${order.supplierName}... Mobile contact placeholder: +91 9112233445`)}
                              className="px-4 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                            >
                              {t.contactSupplier}
                            </button>
                          </div>
                        </div>
                      </div>

                    </div>
                  );
                })}
            </div>
          )}
        </div>
      )}

      {/* ----------------- PROFILE VIEW ----------------- */}
      {activeView === 'profile' && (
        <div className="space-y-6 max-w-xl mx-auto">
          <h2 className="text-2xl font-display font-bold text-gray-800">{t.profile}</h2>

          <div className="bg-white border border-gray-150 rounded-3xl p-6 shadow-sm">
            <form onSubmit={saveProfile} className="space-y-4">
              
              <div className="flex flex-col items-center pb-6 border-b border-gray-100">
                <div className="h-20 w-20 bg-blue-100 text-blue-600 flex items-center justify-center font-extrabold text-3xl rounded-full mb-3 shadow-md shadow-blue-500/5">
                  {currentUser?.name.charAt(0).toUpperCase()}
                </div>
                <h4 className="font-bold text-lg text-gray-800">{currentUser?.name}</h4>
                <p className="text-xs text-gray-400 mt-0.5">Customer • Joined {currentUser?.joinedDate}</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">{t.fullname}</label>
                <div className="relative">
                  <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    required
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-gray-50/50 border border-gray-150 focus:border-blue-500 focus:bg-white rounded-xl text-gray-800 font-medium text-sm transition-all focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Mobile Number</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-semibold text-sm">
                    +91
                  </span>
                  <input
                    type="tel"
                    disabled
                    value={currentUser?.phone || ''}
                    className="w-full pl-13 pr-4 py-3 bg-gray-100 border border-gray-150 rounded-xl text-gray-500 font-medium text-sm cursor-not-allowed"
                  />
                </div>
                <p className="text-[10px] text-gray-400 mt-1 font-semibold">Mobile number cannot be changed for security.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">{t.emailOptional}</label>
                <input
                  type="email"
                  value={profileEmail}
                  onChange={(e) => setProfileEmail(e.target.value)}
                  placeholder={t.emailPlaceholder}
                  className="w-full px-4 py-3 bg-gray-50/50 border border-gray-150 focus:border-blue-500 focus:bg-white rounded-xl text-gray-800 font-medium text-sm transition-all focus:outline-none"
                />
              </div>

              {profileSavedMsg && (
                <div className="p-3 bg-green-50 text-green-700 text-xs font-bold rounded-xl text-center">
                  Profile updated successfully!
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors shadow-md shadow-blue-500/10"
              >
                Save Profile Changes
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ----------------- SAVED ADDRESSES VIEW ----------------- */}
      {activeView === 'addresses' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-display font-bold text-gray-800">{t.savedAddresses}</h2>
            <button
              onClick={() => setShowAddAddressModal(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-colors shadow-md shadow-blue-500/10 cursor-pointer"
            >
              Add New Address
            </button>
          </div>

          {addresses.length === 0 ? (
            <div className="text-center p-12 bg-white border border-gray-150 rounded-3xl max-w-lg mx-auto">
              <p className="text-gray-400 font-medium">No saved addresses found. Click the button above to add one!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {addresses.map((addr) => (
                <div key={addr.id} className="bg-white border border-gray-150 rounded-3xl p-5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between border-b border-gray-50 pb-2 mb-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-800">
                        {addr.type === 'Home' ? <Home className="h-3.5 w-3.5 mr-1" /> : <Building className="h-3.5 w-3.5 mr-1" />}
                        {addr.type}
                      </span>
                      <button
                        onClick={() => removeAddress(addr.id)}
                        className="text-red-500 hover:text-red-700 p-1 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <p className="text-sm text-gray-700 font-medium">{addr.addressLine}</p>
                    <p className="text-xs text-gray-400 font-medium mt-1">Landmark: {addr.landmark}</p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-gray-50 flex items-center justify-between text-xs">
                    <span className="font-bold text-blue-600">{addr.area}</span>
                    <span className="font-semibold text-gray-400">{addr.pincode}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ----------------- ADD ADDRESS MODAL ----------------- */}
      <AnimatePresence>
        {showAddAddressModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddAddressModal(false)}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl border border-gray-100 shadow-2xl relative z-10 w-full max-w-lg p-6 overflow-hidden"
            >
              <div className="flex items-center justify-between border-b border-gray-50 pb-3 mb-4">
                <h3 className="font-display font-bold text-lg text-gray-800">{t.addNewAddress}</h3>
                <button
                  onClick={() => setShowAddAddressModal(false)}
                  className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-50"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleAddAddressSubmit} className="space-y-4">
                {/* Type toggle */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">{t.addressType}</label>
                  <div className="flex space-x-2">
                    {(['Home', 'Office', 'Other'] as const).map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setNewAddrType(type)}
                        className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${
                          newAddrType === type
                            ? 'border-blue-500 bg-blue-50 text-blue-800 shadow-sm'
                            : 'border-gray-150 bg-white text-gray-600 hover:border-gray-300'
                        }`}
                      >
                        {type === 'Home' ? t.addressTypeHome : type === 'Office' ? t.addressTypeOffice : t.addressTypeOther}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Address lines */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">{t.addressLine}</label>
                  <textarea
                    required
                    rows={2}
                    value={newAddrLine}
                    onChange={(e) => setNewAddrLine(e.target.value)}
                    placeholder="e.g. Flat 101, Shiv Mandir Heights, Shaniwar Peth"
                    className="w-full px-4 py-3 bg-gray-50/50 border border-gray-150 focus:border-blue-500 focus:bg-white rounded-xl text-gray-800 font-medium text-sm transition-all focus:outline-none resize-none"
                  />
                </div>

                {/* Landmark */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">{t.landmark}</label>
                  <input
                    type="text"
                    required
                    value={newAddrLandmark}
                    onChange={(e) => setNewAddrLandmark(e.target.value)}
                    placeholder="e.g. Near Shaniwar Wada, Opposite Medical Store"
                    className="w-full px-4 py-3 bg-gray-50/50 border border-gray-150 focus:border-blue-500 focus:bg-white rounded-xl text-gray-800 font-medium text-sm transition-all focus:outline-none"
                  />
                </div>

                {/* Area & Pincode Selection */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">{t.selectArea}</label>
                    <select
                      value={newAddrArea}
                      onChange={(e) => {
                        const areaName = e.target.value;
                        setNewAddrArea(areaName);
                        const matched = PUNE_AREAS.find((a) => a.name === areaName);
                        if (matched) setNewAddrPincode(matched.pincode);
                      }}
                      className="w-full px-4 py-3 bg-gray-50/50 border border-gray-150 focus:border-blue-500 focus:bg-white rounded-xl text-gray-800 font-semibold text-sm focus:outline-none appearance-none"
                    >
                      {PUNE_AREAS.map((a) => (
                        <option key={a.name} value={a.name}>
                          {a.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">{t.pincode}</label>
                    <input
                      type="text"
                      disabled
                      value={newAddrPincode}
                      className="w-full px-4 py-3 bg-gray-100 border border-gray-150 rounded-xl text-gray-500 font-mono text-center font-bold text-sm"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-md shadow-blue-500/10 cursor-pointer mt-2"
                >
                  Save Delivery Address
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
