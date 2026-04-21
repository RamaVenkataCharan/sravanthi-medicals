import { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout';
import Dashboard from './features/dashboard/DashboardPage';
import Billing from './features/billing/BillingPage';
import Inventory from './features/inventory/InventoryPage';
import BillHistory from './pages/BillHistory';
import Customers from './pages/Customers';
import Doctors from './pages/Doctors';
import Reports from './pages/Reports';
import ExpiryManagement from './pages/ExpiryManagement';
import type { PageId } from './lib/constants';

function App() {
  const [currentPage, setCurrentPage] = useState<PageId>('dashboard');

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard onNavigate={setCurrentPage} />;
      case 'billing':
        return <Billing />;
      case 'inventory':
        return <Inventory />;
      case 'history':
        return <BillHistory />;
      case 'customers':
        return <Customers />;
      case 'doctors':
        return <Doctors />;
      case 'reports':
        return <Reports />;
      case 'expiry':
        return <ExpiryManagement />;
      default:
        return <Dashboard onNavigate={setCurrentPage} />;
    }
  };

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: {
            borderRadius: '10px',
            background: '#0f172a',
            color: '#f8fafc',
            fontSize: '14px',
            fontFamily: 'Inter, system-ui, sans-serif',
            fontWeight: '500',
            padding: '12px 16px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.25)',
          },
          success: {
            iconTheme: { primary: '#22c55e', secondary: '#f0fdf4' },
          },
          error: {
            iconTheme: { primary: '#ef4444', secondary: '#fef2f2' },
          },
        }}
      />
      <Layout currentPage={currentPage} onNavigate={setCurrentPage}>
        {renderPage()}
      </Layout>
    </>
  );
}

export default App;
