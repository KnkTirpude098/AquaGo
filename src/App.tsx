import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { AuthScreen } from './components/AuthScreen';
import { CustomerPortal } from './components/CustomerPortal';
import { SupplierPortal } from './components/SupplierPortal';
import { AdminPortal } from './components/AdminPortal';
import { translations } from './translations';

const AppContent: React.FC = () => {
  const { currentUser, currentRole } = useApp();
  const [activeView, setActiveView] = useState<string>('home');

  // Handle route navigation changes
  const handleNavigate = (view: string) => {
    setActiveView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // If user is not logged in, force authentication
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
        <Navbar onNavigate={handleNavigate} activeView="auth" />
        <main className="flex-grow">
          <AuthScreen />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 flex flex-col font-sans antialiased text-gray-800">
      <Navbar onNavigate={handleNavigate} activeView={activeView} />
      
      <main className="flex-grow pb-12">
        {currentRole === 'customer' && (
          <CustomerPortal activeView={activeView} onNavigate={handleNavigate} />
        )}
        
        {currentRole === 'supplier' && (
          <SupplierPortal />
        )}

        {currentRole === 'admin' && (
          <AdminPortal />
        )}
      </main>

      {/* Local Pune Delivery Footer */}
      <footer className="border-t border-gray-150 bg-white py-6 text-center text-xs text-gray-400 font-medium">
        <div className="max-w-7xl mx-auto px-4 space-y-1">
          <p>© 2026 AquaGo Water Deliveries Pvt. Ltd. Pune, Maharashtra.</p>
          <p className="opacity-75">Serving Kothrud, Baner, Wakad, Hinjewadi, Viman Nagar, and all Pune municipal circles.</p>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
