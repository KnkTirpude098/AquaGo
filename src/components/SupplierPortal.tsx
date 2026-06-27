import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { translations } from '../translations';
import { Order, Product, OrderStatus } from '../types';
import { 
  Check, X, Truck, CheckCircle2, Clock, DollarSign, Package, TrendingUp, 
  Settings2, ShoppingBag, Edit3, HelpCircle, Save, AlertCircle, RefreshCw
} from 'lucide-react';
import { motion } from 'motion/react';

export const SupplierPortal: React.FC = () => {
  const {
    language,
    currentUser,
    orders,
    products,
    updateOrderStatus,
    updateProductStock,
    updateProductPrice
  } = useApp();

  const t = translations[language];

  // Tab switcher
  const [activeTab, setActiveTab] = useState<'orders' | 'products' | 'earnings'>('orders');

  // Product edits helper
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState<number>(0);
  const [editStock, setEditStock] = useState<number>(0);

  // Filter orders for this logged-in supplier
  const supplierId = currentUser?.id || '';
  const supplierOrders = orders.filter((o) => o.supplierId === supplierId);
  const supplierProducts = products.filter((p) => p.supplierId === supplierId);

  // Statistics
  const pendingOrders = supplierOrders.filter((o) => o.status === 'pending');
  const activeDeliveries = supplierOrders.filter((o) => ['accepted', 'out_for_delivery'].includes(o.status));
  const completedOrders = supplierOrders.filter((o) => o.status === 'delivered');
  const cancelledOrders = supplierOrders.filter((o) => o.status === 'cancelled');

  const totalEarnings = completedOrders.reduce((acc, o) => acc + o.total, 0);
  const totalOrdersCount = supplierOrders.length;
  const completionRate = totalOrdersCount > 0 
    ? Math.round((completedOrders.length / (totalOrdersCount - pendingOrders.length)) * 100) || 100 
    : 100;

  // Triggering product edit fields
  const startEditing = (p: Product) => {
    setEditingProductId(p.id);
    setEditPrice(p.price);
    setEditStock(p.stock);
  };

  const handleSaveProduct = (productId: string) => {
    if (editPrice <= 0 || editStock < 0) {
      alert('Please enter a valid price and stock count.');
      return;
    }
    updateProductPrice(productId, editPrice);
    updateProductStock(productId, editStock);
    setEditingProductId(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-6" id="supplier-portal">
      
      {/* Top Banner Status */}
      <div className="bg-white border border-gray-150 rounded-3xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 shadow-sm">
        <div className="flex items-center space-x-4">
          <div className="h-16 w-16 bg-green-100 text-green-700 flex items-center justify-center rounded-2xl">
            <Package className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-display font-extrabold text-gray-900">
              {currentUser?.name || 'Water Plant Agent'}
            </h1>
            <p className="text-xs text-gray-400 mt-0.5 font-semibold uppercase tracking-wider">
              {t.supplierDashboard} • Verified Pune Partner
            </p>
          </div>
        </div>

        {/* Tab Selection Navigation */}
        <div className="flex bg-gray-50 p-1 rounded-2xl w-full sm:w-auto">
          {[
            { id: 'orders', label: t.activeOrders, badge: pendingOrders.length },
            { id: 'products', label: t.manageProducts },
            { id: 'earnings', label: t.totalEarnings }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 sm:flex-none px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/10'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <span className="flex items-center justify-center gap-1.5">
                {tab.label}
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-sans animate-pulse">
                    {tab.badge}
                  </span>
                )}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Dashboard Statistics Indicators */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: t.totalEarnings, val: `₹${totalEarnings}`, desc: 'Net revenue in Pune', icon: DollarSign, color: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
          { label: t.totalOrders, val: totalOrdersCount, desc: 'Lifetime received', icon: ShoppingBag, color: 'bg-blue-50 text-blue-600 border-blue-100' },
          { label: t.activeDeliveries, val: activeDeliveries.length, desc: 'In progress', icon: Truck, color: 'bg-purple-50 text-purple-600 border-purple-100' },
          { label: t.completionRate, val: `${completionRate}%`, desc: 'Delivery fulfillment', icon: TrendingUp, color: 'bg-amber-50 text-amber-600 border-amber-100' }
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className={`bg-white border rounded-2xl p-4 flex items-center justify-between ${stat.color} shadow-sm`}>
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">{stat.label}</span>
                <h3 className="text-2xl font-sans font-extrabold">{stat.val}</h3>
                <p className="text-[10px] text-gray-400 font-medium">{stat.desc}</p>
              </div>
              <div className="p-3 bg-white rounded-2xl shadow-sm">
                <Icon className="h-6 w-6" />
              </div>
            </div>
          );
        })}
      </div>

      {/* ----------------- ORDERS DISPATCH LIST TAB ----------------- */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <h3 className="font-display font-extrabold text-lg text-gray-800">
              Orders Management Grid
            </h3>
            <button 
              onClick={() => alert('Simulating data refresh from server...')}
              className="text-xs text-blue-600 hover:text-blue-700 font-bold flex items-center space-x-1"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Refresh Orders</span>
            </button>
          </div>

          {supplierOrders.length === 0 ? (
            <div className="text-center p-12 bg-white border border-gray-150 rounded-3xl text-gray-400 font-medium max-w-lg mx-auto">
              <Clock className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              No customer orders received yet. Pune users will find you once you are active!
            </div>
          ) : (
            <div className="space-y-4">
              {supplierOrders.map((order) => {
                
                // Button layout based on statuses
                const isPending = order.status === 'pending';
                const isAccepted = order.status === 'accepted';
                const isOut = order.status === 'out_for_delivery';

                return (
                  <div key={order.id} className="bg-white border border-gray-150 rounded-3xl p-5 shadow-sm space-y-4">
                    
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-50 pb-3 gap-2">
                      <div>
                        <span className="text-xs font-bold text-gray-400">ORDER LOG</span>
                        <h4 className="font-mono text-sm font-bold text-blue-900">{order.id}</h4>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-400 font-semibold bg-gray-50 px-2 py-1 rounded-lg">
                          Slot: {order.deliverySlot}
                        </span>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold capitalize ${
                          order.status === 'delivered' 
                            ? 'bg-green-100 text-green-800' 
                            : order.status === 'cancelled' 
                            ? 'bg-red-100 text-red-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {order.status.replace(/_/g, ' ')}
                        </span>
                      </div>
                    </div>

                    {/* Items and address details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="space-y-2">
                        <h5 className="font-bold text-gray-800 text-xs uppercase tracking-wider">Water Products</h5>
                        {order.items.map((item) => (
                          <div key={item.productId} className="flex justify-between font-medium">
                            <span>{item.product.name[language]} <strong className="text-blue-600">x{item.quantity}</strong></span>
                            <span>₹{item.product.price * item.quantity}</span>
                          </div>
                        ))}
                        <div className="pt-2 border-t border-gray-50 flex justify-between font-extrabold text-blue-950">
                          <span>Payout (incl. delivery):</span>
                          <span>₹{order.total}</span>
                        </div>
                      </div>

                      <div className="space-y-2 border-l border-gray-50 pl-0 md:pl-4">
                        <h5 className="font-bold text-gray-800 text-xs uppercase tracking-wider">Delivery Destination</h5>
                        <p className="font-bold text-gray-800">{order.customerName}</p>
                        <p className="text-xs text-gray-500 font-semibold">{order.customerPhone}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {order.deliveryAddress.addressLine}, {order.deliveryAddress.landmark}, {order.deliveryAddress.area} ({order.deliveryAddress.pincode})
                        </p>
                      </div>
                    </div>

                    {/* Actions dispatcher */}
                    {(isPending || isAccepted || isOut) && (
                      <div className="flex items-center justify-end space-x-2 pt-3 border-t border-gray-50">
                        {isPending && (
                          <>
                            <button
                              onClick={() => {
                                if (confirm('Are you sure you want to reject this order?')) {
                                  updateOrderStatus(order.id, 'cancelled');
                                }
                              }}
                              className="px-4 py-2 border border-red-200 hover:bg-red-50 text-red-600 text-xs font-bold rounded-xl transition-all cursor-pointer"
                            >
                              {t.reject}
                            </button>
                            <button
                              onClick={() => updateOrderStatus(order.id, 'accepted')}
                              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-blue-500/10 cursor-pointer"
                            >
                              {t.accept}
                            </button>
                          </>
                        )}

                        {isAccepted && (
                          <button
                            onClick={() => updateOrderStatus(order.id, 'out_for_delivery')}
                            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-blue-500/10 cursor-pointer"
                          >
                            🚚 {t.markOutForDelivery}
                          </button>
                        )}

                        {isOut && (
                          <button
                            onClick={() => updateOrderStatus(order.id, 'delivered')}
                            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-emerald-500/10 cursor-pointer"
                          >
                            ✓ {t.markDelivered}
                          </button>
                        )}
                      </div>
                    )}

                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ----------------- PRODUCTS MANAGEMENT TAB ----------------- */}
      {activeTab === 'products' && (
        <div className="space-y-4">
          <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-2xl flex items-center space-x-2 text-xs font-semibold text-blue-800 mb-2">
            <AlertCircle className="h-4 w-4 text-blue-600 shrink-0" />
            <span>{t.pricingTip} Keep stock updated to maintain high seller ranking.</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {supplierProducts.map((p) => {
              const isEditing = editingProductId === p.id;
              return (
                <div key={p.id} className="bg-white border border-gray-150 rounded-3xl p-5 shadow-sm flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="inline-flex px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-100 text-blue-800 capitalize">
                        {p.category}
                      </span>
                      <span className={`h-2.5 w-2.5 rounded-full ${p.stock > 0 ? 'bg-green-500' : 'bg-red-500 animate-ping'}`} />
                    </div>

                    <h4 className="font-display font-extrabold text-gray-900 text-sm sm:text-base">
                      {p.name[language]}
                    </h4>
                    <p className="text-xs text-gray-400 font-medium line-clamp-2">
                      {p.description[language]}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-gray-50 mt-4">
                    {isEditing ? (
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Stock Level</label>
                            <input
                              type="number"
                              value={editStock}
                              onChange={(e) => setEditStock(parseInt(e.target.value) || 0)}
                              className="w-full px-2 py-1.5 bg-gray-50 border border-gray-150 rounded-xl text-center font-bold text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Selling Price (₹)</label>
                            <input
                              type="number"
                              value={editPrice}
                              onChange={(e) => setEditPrice(parseInt(e.target.value) || 0)}
                              className="w-full px-2 py-1.5 bg-gray-50 border border-gray-150 rounded-xl text-center font-bold text-sm"
                            />
                          </div>
                        </div>

                        <div className="flex space-x-2">
                          <button
                            onClick={() => setEditingProductId(null)}
                            className="flex-1 py-1.5 border border-gray-200 text-gray-500 text-xs font-bold rounded-lg hover:bg-gray-50"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleSaveProduct(p.id)}
                            className="flex-1 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 flex items-center justify-center space-x-1"
                          >
                            <Save className="h-3.5 w-3.5" />
                            <span>Save Changes</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{t.productPrice}</span>
                          <p className="text-xl font-sans font-extrabold text-blue-900">₹{p.price}</p>
                          <span className="text-[10px] text-gray-500 font-semibold">Inventory Stock: <strong>{p.stock}</strong></span>
                        </div>

                        <button
                          onClick={() => startEditing(p)}
                          className="px-3.5 py-1.5 bg-gray-50 border border-gray-150 hover:bg-blue-50 hover:text-blue-600 text-gray-600 text-xs font-bold rounded-xl transition-all flex items-center space-x-1"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                          <span>Edit Stock/Price</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ----------------- COMPLETED EARNINGS LOGS TAB ----------------- */}
      {activeTab === 'earnings' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <h3 className="font-display font-extrabold text-lg text-gray-800">
              Pune Delivery Payout Registry
            </h3>
            <span className="text-xs text-gray-500 font-medium">Payouts are settled directly to registered UPI on delivery.</span>
          </div>

          {completedOrders.length === 0 ? (
            <div className="text-center p-12 bg-white border border-gray-150 rounded-3xl text-gray-400 font-medium max-w-lg mx-auto">
              No completed orders registered. Payout will update here as you fulfill deliveries!
            </div>
          ) : (
            <div className="bg-white border border-gray-150 rounded-3xl divide-y divide-gray-100 overflow-hidden shadow-sm">
              {completedOrders.map((order) => (
                <div key={order.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm">
                  <div>
                    <span className="font-mono text-xs font-bold text-gray-400">{order.id}</span>
                    <h5 className="font-bold text-gray-800 mt-0.5">{order.customerName} ({order.deliveryAddress.area})</h5>
                    <p className="text-xs text-gray-400 font-medium">{new Date(order.orderDate).toLocaleDateString()}</p>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end space-x-6">
                    <span className="text-xs font-semibold bg-green-50 text-green-700 px-2 py-0.5 rounded-lg">Fulfillment Paid</span>
                    <span className="font-sans font-extrabold text-base text-emerald-600 text-right w-24">
                      +₹{order.total}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
};
