import { BrowserRouter, Route, Routes } from 'react-router-dom';
import MainLayout from './components/layouts/MainLayout';
import ProtectedRoute from './routes/ProtectedRoute';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import SearchPage from './pages/customer/SearchPage';
import CustomerPackagesPage from './pages/customer/CustomerPackagesPage';
import MyBookingsPage from './pages/customer/MyBookingsPage';
import BookingPage from './pages/customer/BookingPage';
import PaymentPage from './pages/customer/PaymentPage';
import CustomerProfilePage from './pages/customer/CustomerProfilePage';
import OrdersPage from './pages/provider/OrdersPage';
import SchedulePage from './pages/provider/SchedulePage';
import ProviderProfilePage from './pages/provider/ProviderProfilePage';
import ReportPage from './pages/provider/ReportPage';
import DashboardPage from './pages/admin/DashboardPage';
import PackagesPage from './pages/admin/PackagesPage';
import VerifyPaymentPage from './pages/admin/VerifyPaymentPage';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route
          element={(
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          )}
        >
          <Route path="/" element={<SearchPage />} />
          <Route path="/customer/packages" element={<CustomerPackagesPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/profile" element={
            <ProtectedRoute allowedRoles={['customer']}>
              <CustomerProfilePage />
            </ProtectedRoute>
          } />
          <Route path="/my-bookings" element={<MyBookingsPage />} />
          <Route path="/booking" element={<BookingPage />} />
          <Route path="/payment" element={<PaymentPage />} />

          <Route
            path="/provider/profile"
            element={
              <ProtectedRoute allowedRoles={['provider']}>
                <ProviderProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders"
            element={
              <ProtectedRoute allowedRoles={['provider']}>
                <OrdersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/schedule"
            element={
              <ProtectedRoute allowedRoles={['provider']}>
                <SchedulePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/provider/report"
            element={
              <ProtectedRoute allowedRoles={['provider']}>
                <ReportPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/packages"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <PackagesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/verify-payment"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <VerifyPaymentPage />
              </ProtectedRoute>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
