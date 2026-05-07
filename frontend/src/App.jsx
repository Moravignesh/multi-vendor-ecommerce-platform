import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { getCart } from './api/cart'

import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'

import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import ProductsPage from './pages/ProductsPage'
import ProductDetail from './pages/ProductDetail'
import CartPage from './pages/CartPage'
import OrdersPage from './pages/OrdersPage'

import VendorProducts from './pages/vendor/VendorProducts'
import VendorOrders from './pages/vendor/VendorOrders'

import AdminDashboard from './pages/admin/AdminDashboard'
import AdminVendors from './pages/admin/AdminVendors'
import AdminOrders from './pages/admin/AdminOrders'
import AdminProducts from './pages/admin/AdminProducts'
import AdminUsers from './pages/admin/AdminUsers'

function AppContent() {
  const { user, isCustomer } = useAuth()
  const [cartCount, setCartCount] = useState(0)

  const refreshCartCount = async () => {
    if (!isCustomer) { setCartCount(0); return }
    try {
      const { data } = await getCart()
      setCartCount(data.items?.length || 0)
    } catch { setCartCount(0) }
  }

  useEffect(() => { refreshCartCount() }, [user])

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar cartCount={cartCount} />
      <main className="flex-1">
        <Routes>
          {/* Public */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/products" element={<ProductsPage onCartUpdate={refreshCartCount} />} />
          <Route path="/products/:id" element={<ProductDetail onCartUpdate={refreshCartCount} />} />

          {/* Customer */}
          <Route path="/cart" element={
            <ProtectedRoute roles={['customer']}>
              <CartPage onCartUpdate={refreshCartCount} />
            </ProtectedRoute>
          } />
          <Route path="/orders" element={
            <ProtectedRoute roles={['customer']}>
              <OrdersPage />
            </ProtectedRoute>
          } />

          {/* Vendor */}
          <Route path="/vendor/products" element={
            <ProtectedRoute roles={['vendor']}>
              <VendorProducts />
            </ProtectedRoute>
          } />
          <Route path="/vendor/orders" element={
            <ProtectedRoute roles={['vendor']}>
              <VendorOrders />
            </ProtectedRoute>
          } />

          {/* Admin */}
          <Route path="/admin" element={
            <ProtectedRoute roles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin/vendors" element={
            <ProtectedRoute roles={['admin']}>
              <AdminVendors />
            </ProtectedRoute>
          } />
          <Route path="/admin/orders" element={
            <ProtectedRoute roles={['admin']}>
              <AdminOrders />
            </ProtectedRoute>
          } />
          <Route path="/admin/products" element={
            <ProtectedRoute roles={['admin']}>
              <AdminProducts />
            </ProtectedRoute>
          } />
          <Route path="/admin/users" element={
            <ProtectedRoute roles={['admin']}>
              <AdminUsers />
            </ProtectedRoute>
          } />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  )
}
