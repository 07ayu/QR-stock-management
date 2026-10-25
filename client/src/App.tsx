import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AppLayout } from './components/layout/AppLayout';
import { DashboardPage } from './pages/Dashboard/DashboardPage';
import { ProductsPage } from './pages/Products/ProductsPage';
import { InventoryPage } from './pages/Inventory/InventoryPage';
import { TransfersPage } from './pages/Transfers/TransfersPage';
import { SalesPage } from './pages/Sales/SalesPage';
import { InvoicesPage } from './pages/Invoices/InvoicesPage';
import { LoginPage } from './pages/Login/LoginPage';

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        
        <Route path="/" element={<AppLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="products" element={<ProductsPage />} />
          <Route path="inventory" element={<InventoryPage />} />
          <Route path="transfers" element={<TransfersPage />} />
          <Route path="sales" element={<SalesPage />} />
          <Route path="invoices" element={<InvoicesPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
