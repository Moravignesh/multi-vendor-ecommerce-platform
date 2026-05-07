import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { ShoppingBag, Store, Shield, Zap } from 'lucide-react'

export default function Home() {
  const { user, isVendor, isAdmin } = useAuth()

  const features = [
    { icon: '🛍️', title: 'Multi-Vendor Marketplace', desc: 'Shop from hundreds of verified vendors all in one place.' },
    { icon: '🔒', title: 'Secure Payments', desc: 'Every transaction is safe and protected with JWT-based auth.' },
    { icon: '📦', title: 'Smart Order Splitting', desc: 'Orders with multiple vendors are automatically split per vendor.' },
    { icon: '⚡', title: 'Real-time Stock', desc: 'Concurrent-safe inventory ensures you only buy what\'s available.' },
  ]

  return (
    <div>
      {/* Hero */}
      <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-800 text-white">
        <div className="max-w-6xl mx-auto px-6 py-20 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-1.5 text-sm mb-6 backdrop-blur-sm">
            <Zap size={14} /> Multi-Vendor E-Commerce Platform
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight">
            One Platform,<br />
            <span className="text-yellow-300">Unlimited Vendors</span>
          </h1>
          <p className="text-lg text-indigo-100 mb-10 max-w-2xl mx-auto">
            Browse thousands of products from verified sellers. Vendors manage their own inventory.
            Orders are automatically split per vendor for seamless fulfillment.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/products" className="bg-white text-indigo-700 font-bold px-8 py-3 rounded-xl hover:bg-indigo-50 transition-colors flex items-center gap-2">
              <ShoppingBag size={20} /> Start Shopping
            </Link>
            {!user && (
              <Link to="/register" className="bg-indigo-500/50 backdrop-blur text-white border border-white/30 font-bold px-8 py-3 rounded-xl hover:bg-indigo-500/70 transition-colors flex items-center gap-2">
                <Store size={20} /> Become a Vendor
              </Link>
            )}
            {isVendor && (
              <Link to="/vendor/products" className="bg-emerald-500 text-white font-bold px-8 py-3 rounded-xl hover:bg-emerald-600 transition-colors flex items-center gap-2">
                <Store size={20} /> Vendor Dashboard
              </Link>
            )}
            {isAdmin && (
              <Link to="/admin" className="bg-purple-500 text-white font-bold px-8 py-3 rounded-xl hover:bg-purple-600 transition-colors flex items-center gap-2">
                <Shield size={20} /> Admin Dashboard
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">Why Choose ShopHub?</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => (
            <div key={i} className="card text-center hover:shadow-md transition-shadow">
              <div className="text-4xl mb-4">{f.icon}</div>
              <h3 className="font-bold text-gray-900 mb-2">{f.title}</h3>
              <p className="text-gray-500 text-sm">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Role cards */}
      <div className="bg-gray-50 border-t border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <h2 className="text-3xl font-bold text-center mb-12">For Everyone</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { role: 'Customer', emoji: '🛍️', color: 'indigo', features: ['Browse & search products', 'Add to cart', 'Track order status', 'Rate & review products'], cta: 'Shop Now', link: '/products' },
              { role: 'Vendor', emoji: '🏪', color: 'emerald', features: ['List products easily', 'Manage inventory & stock', 'View vendor-specific orders', 'Update shipping status'], cta: 'Start Selling', link: '/register' },
              { role: 'Admin', emoji: '🛡️', color: 'purple', features: ['Approve/reject vendors', 'View all orders & users', 'Platform-wide analytics', 'Manage all products'], cta: 'Admin Access', link: '/login' },
            ].map(r => (
              <div key={r.role} className={`card border-t-4 ${r.color === 'indigo' ? 'border-indigo-500' : r.color === 'emerald' ? 'border-emerald-500' : 'border-purple-500'}`}>
                <div className="text-4xl mb-3">{r.emoji}</div>
                <h3 className="text-xl font-bold mb-4">{r.role}</h3>
                <ul className="space-y-2 mb-6">
                  {r.features.map((f, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                      <span className="text-green-500">✓</span> {f}
                    </li>
                  ))}
                </ul>
                <Link to={r.link} className={`btn-primary w-full text-center block ${r.color === 'emerald' ? 'bg-emerald-600 hover:bg-emerald-700' : r.color === 'purple' ? 'bg-purple-600 hover:bg-purple-700' : ''}`}>
                  {r.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 text-center py-8">
        <p className="text-sm">© 2025 ShopHub — Multi-Vendor E-Commerce Platform. Built with FastAPI + React.</p>
        <p className="text-xs mt-1">Default admin: admin@example.com / admin123</p>
      </footer>
    </div>
  )
}
