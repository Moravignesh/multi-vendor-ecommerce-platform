import { useState, useEffect } from 'react'
import { getAdminStats } from '../../api/orders'
import { Users, Package, ShoppingCart, TrendingUp, AlertCircle } from 'lucide-react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getAdminStats()
      .then(r => setStats(r.data))
      .catch(() => toast.error('Failed to load stats'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center min-h-96">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600" />
    </div>
  )

  const statCards = [
    { label: 'Total Users', value: stats?.total_users, icon: Users, color: 'indigo', link: '/admin/users' },
    { label: 'Total Vendors', value: stats?.total_vendors, icon: Package, color: 'emerald', link: '/admin/vendors' },
    { label: 'Pending Approvals', value: stats?.pending_vendor_approvals, icon: AlertCircle, color: 'amber', link: '/admin/vendors' },
    { label: 'Total Products', value: stats?.total_products, icon: Package, color: 'blue', link: '/admin/products' },
    { label: 'Total Orders', value: stats?.total_orders, icon: ShoppingCart, color: 'purple', link: '/admin/orders' },
    { label: 'Revenue (Paid+)', value: `₹${(stats?.revenue || 0).toFixed(2)}`, icon: TrendingUp, color: 'green', link: '/admin/orders' },
  ]

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-gray-500">Platform-wide overview</p>
      </div>

      {stats?.pending_vendor_approvals > 0 && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-3">
          <AlertCircle size={20} className="text-amber-600 flex-shrink-0" />
          <p className="text-amber-800 text-sm">
            <strong>{stats.pending_vendor_approvals} vendor{stats.pending_vendor_approvals > 1 ? 's' : ''}</strong> waiting for approval.{' '}
            <Link to="/admin/vendors" className="underline font-medium">Review now →</Link>
          </p>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-10">
        {statCards.map(s => {
          const Icon = s.icon
          const colorMap = {
            indigo: 'bg-indigo-50 text-indigo-600',
            emerald: 'bg-emerald-50 text-emerald-600',
            amber: 'bg-amber-50 text-amber-600',
            blue: 'bg-blue-50 text-blue-600',
            purple: 'bg-purple-50 text-purple-600',
            green: 'bg-green-50 text-green-600',
          }
          return (
            <Link key={s.label} to={s.link} className="card hover:shadow-md transition-shadow flex items-center gap-4">
              <div className={`p-3 rounded-xl ${colorMap[s.color]}`}>
                <Icon size={22} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{s.value}</p>
                <p className="text-gray-500 text-sm">{s.label}</p>
              </div>
            </Link>
          )
        })}
      </div>

      {/* Quick action links */}
      <div className="grid md:grid-cols-3 gap-4">
        {[
          { title: 'Manage Vendors', desc: 'Approve or reject vendor applications', link: '/admin/vendors', emoji: '🏪', color: 'emerald' },
          { title: 'All Orders', desc: 'View every order across the platform', link: '/admin/orders', emoji: '📦', color: 'indigo' },
          { title: 'All Products', desc: 'Browse every listed product', link: '/admin/products', emoji: '🛍️', color: 'purple' },
        ].map(a => (
          <Link key={a.title} to={a.link} className="card hover:shadow-md transition-shadow">
            <div className="text-3xl mb-2">{a.emoji}</div>
            <h3 className="font-bold text-gray-900">{a.title}</h3>
            <p className="text-gray-500 text-sm">{a.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
