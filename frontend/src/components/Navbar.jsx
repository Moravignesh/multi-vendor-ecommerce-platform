import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { ShoppingCart, Package, LayoutDashboard, LogOut, Store, Users, ShoppingBag } from 'lucide-react'
import { useState } from 'react'

export default function Navbar({ cartCount = 0 }) {
  const { user, logout, isAdmin, isVendor, isCustomer } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 font-bold text-xl text-indigo-600">
            <Store size={24} />
            ShopHub
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/products" className="text-gray-600 hover:text-indigo-600 transition-colors flex items-center gap-1">
              <ShoppingBag size={16} /> Browse
            </Link>

            {isCustomer && (
              <>
                <Link to="/cart" className="relative text-gray-600 hover:text-indigo-600 transition-colors flex items-center gap-1">
                  <ShoppingCart size={16} /> Cart
                  {cartCount > 0 && (
                    <span className="absolute -top-2 -right-3 bg-indigo-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {cartCount}
                    </span>
                  )}
                </Link>
                <Link to="/orders" className="text-gray-600 hover:text-indigo-600 transition-colors flex items-center gap-1">
                  <Package size={16} /> Orders
                </Link>
              </>
            )}

            {isVendor && (
              <>
                <Link to="/vendor/products" className="text-gray-600 hover:text-emerald-600 transition-colors flex items-center gap-1">
                  <Package size={16} /> My Products
                </Link>
                <Link to="/vendor/orders" className="text-gray-600 hover:text-emerald-600 transition-colors flex items-center gap-1">
                  <ShoppingCart size={16} /> My Orders
                </Link>
              </>
            )}

            {isAdmin && (
              <>
                <Link to="/admin" className="text-gray-600 hover:text-purple-600 transition-colors flex items-center gap-1">
                  <LayoutDashboard size={16} /> Dashboard
                </Link>
                <Link to="/admin/vendors" className="text-gray-600 hover:text-purple-600 transition-colors flex items-center gap-1">
                  <Users size={16} /> Vendors
                </Link>
              </>
            )}

            {user ? (
              <div className="flex items-center gap-3 ml-4 pl-4 border-l border-gray-200">
                <div className="text-sm">
                  <p className="font-medium text-gray-900">{user.full_name}</p>
                  <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                </div>
                <button onClick={handleLogout} className="text-gray-500 hover:text-red-600 transition-colors">
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 ml-4">
                <Link to="/login" className="btn-secondary text-sm py-1.5">Login</Link>
                <Link to="/register" className="btn-primary text-sm py-1.5">Sign Up</Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button className="md:hidden text-gray-600" onClick={() => setMenuOpen(!menuOpen)}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /> :
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden py-3 border-t border-gray-100 space-y-2 pb-4">
            <Link to="/products" className="block px-2 py-1.5 text-gray-700" onClick={() => setMenuOpen(false)}>Browse Products</Link>
            {isCustomer && <>
              <Link to="/cart" className="block px-2 py-1.5 text-gray-700" onClick={() => setMenuOpen(false)}>Cart {cartCount > 0 && `(${cartCount})`}</Link>
              <Link to="/orders" className="block px-2 py-1.5 text-gray-700" onClick={() => setMenuOpen(false)}>My Orders</Link>
            </>}
            {isVendor && <>
              <Link to="/vendor/products" className="block px-2 py-1.5 text-gray-700" onClick={() => setMenuOpen(false)}>My Products</Link>
              <Link to="/vendor/orders" className="block px-2 py-1.5 text-gray-700" onClick={() => setMenuOpen(false)}>My Orders</Link>
            </>}
            {isAdmin && <>
              <Link to="/admin" className="block px-2 py-1.5 text-gray-700" onClick={() => setMenuOpen(false)}>Admin Dashboard</Link>
              <Link to="/admin/vendors" className="block px-2 py-1.5 text-gray-700" onClick={() => setMenuOpen(false)}>Manage Vendors</Link>
            </>}
            {user
              ? <button onClick={() => { handleLogout(); setMenuOpen(false) }} className="block w-full text-left px-2 py-1.5 text-red-600">Logout</button>
              : <div className="flex gap-2 px-2 pt-2">
                  <Link to="/login" className="btn-secondary text-sm" onClick={() => setMenuOpen(false)}>Login</Link>
                  <Link to="/register" className="btn-primary text-sm" onClick={() => setMenuOpen(false)}>Sign Up</Link>
                </div>
            }
          </div>
        )}
      </div>
    </nav>
  )
}
