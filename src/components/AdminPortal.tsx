import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { translations } from '../translations';
import { PUNE_AREAS, User, SupplierDetails } from '../types';
import { 
  Users, Store, TrendingUp, DollarSign, Check, X, ShieldAlert, Truck, 
  MapPin, ShoppingBag, Eye, ShieldCheck, Ban, Trash, Activity, Search
} from 'lucide-react';
import { motion } from 'motion/react';

export const AdminPortal: React.FC = () => {
  const {
    language,
    users,
    suppliers,
    orders,
    approveSupplier,
    updateSupplierStatus,
    toggleUserStatus
  } = useApp();

  const t = translations[language];

  // Tab state
  const [adminTab, setAdminTab] = useState<'dashboard' | 'customers' | 'suppliers' | 'orders'>('dashboard');

  // Search/Filter state
  const [orderQuery, setOrderQuery] = useState('');
  const [userQuery, setUserQuery] = useState('');

  // Statistics
  const customerCount = users.filter((u) => u.role === 'customer').length;
  const supplierCount = users.filter((u) => u.role === 'supplier').length;
  const totalOrdersCount = orders.length;
  
  // Commission Calculations: Platform takes a simulated 10% commission of all delivered orders
  const deliveredOrders = orders.filter((o) => o.status === 'delivered');
  const totalTurnover = deliveredOrders.reduce((acc, o) => acc + o.total, 0);
  const platformRevenue = Math.round(totalTurnover * 0.1);

  // Supplier Approvals State
  const pendingApprovals = suppliers.filter((s) => !s.isApproved);
  const activeSuppliers = suppliers.filter((s) => s.isApproved);

  // --- Pune Area Analytics calculations ---
  const ordersByArea: Record<string, number> = {};
  PUNE_AREAS.forEach((area) => {
    ordersByArea[area.name] = 0;
  });
  
  orders.forEach((o) => {
    const area = o.deliveryAddress.area;
    if (ordersByArea[area] !== undefined) {
      ordersByArea[area] += 1;
    } else {
      ordersByArea[area] = 1;
    }
  });

  const topArea = Object.entries(ordersByArea).reduce((a, b) => (b[1] > a[1] ? b : a), ['None', 0]);

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-6" id="admin-portal">
      
      {/* Admin Title Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-950 to-blue-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
        <div className="space-y-3 max-w-xl text-center md:text-left">
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-red-500/20 text-red-300 border border-red-500/30">
            🛡️ Master Platform Administration
          </span>
          <h1 className="text-2xl sm:text-3xl font-display font-extrabold tracking-tight">
            {t.adminDashboard}
          </h1>
          <p className="text-blue-200/80 text-xs sm:text-sm font-medium">
            Monitor Pune water supply chains, audit vendor payouts, verify certifications, and toggle operator statuses.
          </p>
        </div>

        {/* Tab selection */}
        <div className="flex flex-wrap gap-2 bg-white/10 p-1.5 rounded-2xl w-full md:w-auto">
          {[
            { id: 'dashboard', label: t.platformOverview, icon: Activity },
            { id: 'customers', label: t.customerList, icon: Users },
            { id: 'suppliers', label: t.supplierList, icon: Store },
            { id: 'orders', label: t.systemOrders, icon: ShoppingBag }
          ].map((tab) => {
            const Icon = tab.icon;
            const isSel = adminTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setAdminTab(tab.id as any)}
                className={`flex-1 md:flex-none px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
                  isSel 
                    ? 'bg-white text-blue-900 shadow-lg font-extrabold' 
                    : 'text-blue-100 hover:bg-white/15 hover:text-white'
                }`}
              >
                <Icon className="h-4.5 w-4.5" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid Statistics Panel */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Platform Rev (10%)', val: `₹${platformRevenue}`, desc: 'Commission on delivery', icon: DollarSign, color: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
          { label: t.totalCustomers, val: customerCount, desc: 'Registered in Pune', icon: Users, color: 'bg-blue-50 text-blue-700 border-blue-100' },
          { label: t.totalSuppliers, val: supplierCount, desc: 'Verified water plants', icon: Store, color: 'bg-indigo-50 text-indigo-700 border-indigo-100 border' },
          { label: 'Total Orders Logged', val: totalOrdersCount, desc: `Hotspot: ${topArea[0]}`, icon: Truck, color: 'bg-purple-50 text-purple-700 border-purple-100' }
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className={`bg-white border rounded-2xl p-4 flex items-center justify-between shadow-sm ${stat.color}`}>
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{stat.label}</span>
                <h3 className="text-xl sm:text-2xl font-sans font-extrabold">{stat.val}</h3>
                <p className="text-[10px] text-gray-400 font-medium">{stat.desc}</p>
              </div>
              <div className="p-2.5 bg-white rounded-xl shadow-sm">
                <Icon className="h-5.5 w-5.5" />
              </div>
            </div>
          );
        })}
      </div>

      {/* ----------------- ADMIN DASHBOARD / PLATFORM OVERVIEW TAB ----------------- */}
      {adminTab === 'dashboard' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Supplier Registrations Pending Verification */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-display font-extrabold text-lg text-gray-800">
                {t.supplierApprovals}
              </h3>
              <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse">
                {pendingApprovals.length} Pending
              </span>
            </div>

            {pendingApprovals.length === 0 ? (
              <div className="text-center p-8 bg-gray-50 border border-gray-150 rounded-2xl text-gray-400 font-medium">
                No new supplier registrations awaiting review.
              </div>
            ) : (
              <div className="space-y-3">
                {pendingApprovals.map((sup) => {
                  const userRecord = users.find((u) => u.id === sup.id);
                  return (
                    <div key={sup.id} className="p-4 bg-white border border-amber-200 shadow-sm rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-start space-x-3.5">
                        <img 
                          src={sup.imageUrl} 
                          alt={sup.shopName} 
                          className="h-12 w-12 rounded-xl object-cover shrink-0 border border-amber-100"
                        />
                        <div>
                          <h4 className="font-bold text-sm text-gray-900">{sup.shopName}</h4>
                          <p className="text-xs text-gray-400 font-medium mt-0.5">Owner: {userRecord?.name} ({userRecord?.phone})</p>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {sup.areasCovered.map((a) => (
                              <span key={a} className="inline-flex px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-50 text-blue-800">
                                {a}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 border-t sm:border-0 pt-3 sm:pt-0 justify-end">
                        <button
                          onClick={() => {
                            if (confirm('Decline and remove this supplier application?')) {
                              // Simulated removal
                              alert('Supplier registration declined.');
                            }
                          }}
                          className="px-3 py-1.5 border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                        >
                          Decline
                        </button>
                        <button
                          onClick={() => {
                            approveSupplier(sup.id);
                            alert(`${sup.shopName} is now authorized to deliver water on AquaGo Pune!`);
                          }}
                          className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-sm transition-colors cursor-pointer"
                        >
                          {t.approve}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Area Performance Distribution Chart (Pure HTML/CSS) */}
          <div className="lg:col-span-5 bg-white border border-gray-150 rounded-3xl p-6 space-y-4">
            <h3 className="font-display font-bold text-lg text-gray-800 border-b border-gray-50 pb-3">
              {t.ordersByArea}
            </h3>

            <div className="space-y-4 pt-1">
              {PUNE_AREAS.slice(0, 5).map((area) => {
                const count = ordersByArea[area.name] || 0;
                // find percentage based on total orders
                const percentage = totalOrdersCount > 0 ? Math.round((count / totalOrdersCount) * 100) : 0;
                
                return (
                  <div key={area.name} className="space-y-1">
                    <div className="flex justify-between text-xs font-bold text-gray-700">
                      <span>{area.name} ({area.pincode})</span>
                      <span className="text-blue-600 font-mono">{count} orders ({percentage}%)</span>
                    </div>
                    {/* Bar visualization */}
                    <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-600 rounded-full transition-all duration-500"
                        style={{ width: `${Math.max(percentage, 4)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}

      {/* ----------------- CUSTOMERS DATABASE TAB ----------------- */}
      {adminTab === 'customers' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-3">
            <h3 className="font-display font-extrabold text-lg text-gray-800">
              Customer Registry Log
            </h3>
            
            {/* Search Customers */}
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-gray-400" />
              <input
                type="text"
                value={userQuery}
                onChange={(e) => setUserQuery(e.target.value)}
                placeholder="Search customers by name or phone..."
                className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-150 rounded-xl focus:border-blue-500 focus:bg-white text-xs font-semibold focus:outline-none transition-all"
              />
            </div>
          </div>

          <div className="bg-white border border-gray-150 rounded-3xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/70 border-b border-gray-100 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                    <th className="px-6 py-3.5">Customer Name</th>
                    <th className="px-6 py-3.5">Contact Number</th>
                    <th className="px-6 py-3.5">Joined Date</th>
                    <th className="px-6 py-3.5">Status</th>
                    <th className="px-6 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs font-medium text-gray-700">
                  {users
                    .filter((u) => u.role === 'customer')
                    .filter((u) => u.name.toLowerCase().includes(userQuery.toLowerCase()) || u.phone.includes(userQuery))
                    .map((cust) => (
                      <tr key={cust.id} className="hover:bg-gray-50/30 transition-colors">
                        <td className="px-6 py-4 font-bold text-gray-900">{cust.name}</td>
                        <td className="px-6 py-4 font-mono text-gray-500">+91 {cust.phone}</td>
                        <td className="px-6 py-4 text-gray-400">{cust.joinedDate}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            cust.isActive 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {cust.isActive ? t.active : t.suspended}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => {
                              toggleUserStatus(cust.id);
                              alert(`${cust.name}'s account active status has been toggled.`);
                            }}
                            className={`px-3 py-1.5 border text-[10px] font-bold rounded-lg transition-colors cursor-pointer ${
                              cust.isActive
                                ? 'border-red-200 text-red-600 hover:bg-red-50'
                                : 'border-green-200 text-green-600 hover:bg-green-50'
                            }`}
                          >
                            {cust.isActive ? t.suspend : t.activate}
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ----------------- SUPPLIERS REGISTRY TAB ----------------- */}
      {adminTab === 'suppliers' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <h3 className="font-display font-extrabold text-lg text-gray-800">
              Active Supplier Registry ({activeSuppliers.length})
            </h3>
            <span className="text-xs text-gray-400 font-medium">Verified drinking water agencies packing in ISI sanitized cans.</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeSuppliers.map((sup) => {
              const userRecord = users.find((u) => u.id === sup.id);
              return (
                <div key={sup.id} className="bg-white border border-gray-150 rounded-3xl p-5 flex flex-col justify-between shadow-sm">
                  <div>
                    <div className="flex items-center justify-between border-b border-gray-50 pb-3 mb-3">
                      <h4 className="font-bold text-sm text-gray-900 truncate">{sup.shopName}</h4>
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        sup.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {sup.status === 'active' ? t.active : t.suspended}
                      </span>
                    </div>

                    <p className="text-xs text-gray-400 font-medium">Owner: {userRecord?.name}</p>
                    <p className="text-xs text-gray-400 font-mono mt-0.5">+91 {userRecord?.phone}</p>
                    
                    <div className="flex flex-wrap gap-1 mt-3">
                      {sup.areasCovered.map((area) => (
                        <span key={area} className="px-1.5 py-0.5 bg-blue-50 text-blue-800 text-[9px] font-bold rounded">
                          {area}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-gray-50 flex items-center justify-between">
                    <span className="text-xs text-gray-400 font-bold">Min Order: ₹{sup.minOrderValue}</span>
                    
                    <button
                      onClick={() => {
                        const newStatus = sup.status === 'active' ? 'suspended' : 'active';
                        updateSupplierStatus(sup.id, newStatus);
                        alert(`${sup.shopName} has been ${newStatus}.`);
                      }}
                      className={`px-3 py-1.5 border text-[10px] font-bold rounded-lg transition-colors cursor-pointer ${
                        sup.status === 'active'
                          ? 'border-red-200 text-red-600 hover:bg-red-50'
                          : 'border-green-200 text-green-600 hover:bg-green-50'
                      }`}
                    >
                      {sup.status === 'active' ? t.suspend : t.activate}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ----------------- MASTER ORDER LOGGER TAB ----------------- */}
      {adminTab === 'orders' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-3">
            <h3 className="font-display font-extrabold text-lg text-gray-800">
              System Delivery Logs
            </h3>
            
            {/* Filter orders */}
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-gray-400" />
              <input
                type="text"
                value={orderQuery}
                onChange={(e) => setOrderQuery(e.target.value)}
                placeholder="Search orders by Area, ID, or Customer..."
                className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-150 rounded-xl focus:border-blue-500 focus:bg-white text-xs font-semibold focus:outline-none transition-all"
              />
            </div>
          </div>

          <div className="space-y-3">
            {orders
              .filter((o) => {
                const query = orderQuery.toLowerCase();
                return (
                  o.id.toLowerCase().includes(query) ||
                  o.customerName.toLowerCase().includes(query) ||
                  o.deliveryAddress.area.toLowerCase().includes(query) ||
                  o.supplierName.toLowerCase().includes(query)
                );
              })
              .map((order) => (
                <div key={order.id} className="p-4 bg-white border border-gray-150 rounded-2xl flex flex-col sm:flex-row justify-between gap-4 text-xs">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono font-bold text-blue-900">{order.id}</span>
                      <span className="text-gray-400 font-medium">• {new Date(order.orderDate).toLocaleString()}</span>
                    </div>

                    <div className="mt-2 space-y-1 text-gray-500 font-semibold">
                      <div>
                        Customer: <span className="text-gray-800 font-bold">{order.customerName}</span> (+91 {order.customerPhone})
                      </div>
                      <div>
                        Supplier Assigned: <span className="text-blue-700 font-bold">{order.supplierName}</span>
                      </div>
                      <div>
                        Destination: <span className="text-gray-800 font-bold">{order.deliveryAddress.addressLine}, {order.deliveryAddress.area}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col justify-between items-end border-t sm:border-0 pt-3 sm:pt-0">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      order.status === 'delivered' 
                        ? 'bg-green-100 text-green-800' 
                        : order.status === 'cancelled' 
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {order.status.replace(/_/g, ' ')}
                    </span>

                    <span className="text-sm font-sans font-extrabold text-blue-950 mt-2">
                      Total Pay: ₹{order.total}
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

    </div>
  );
};
