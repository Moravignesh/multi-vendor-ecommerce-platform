import { useState, useEffect } from 'react'
import { getMyOrders } from '../api/orders'
import StatusBadge from '../components/StatusBadge'
import { Package, ChevronDown, ChevronUp } from 'lucide-react'
import toast from 'react-hot-toast'

export default function OrdersPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState({})

  useEffect(() => {
    getMyOrders()
      .then(r => setOrders(r.data))
      .catch(() => toast.error('Failed to load orders'))
      .finally(() => setLoading(false))
  }, [])

  const toggle = (id) => setExpanded(p => ({ ...p, [id]: !p[id] }))

  if (loading) return (
    <div className="flex items-center justify-center min-h-96">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" />
    </div>
  )

  if (orders.length === 0) return (
    <div className="max-w-2xl mx-auto px-4 py-20 text-center">
      <Package size={64} className="mx-auto text-gray-300 mb-4" />
      <h2 className="text-xl font-bold text-gray-700 mb-2">No orders yet</h2>
      <p className="text-gray-500">Start shopping to see your orders here</p>
    </div>
  )

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">My Orders</h1>
      <div className="space-y-4">
        {orders.map(order => (
          <div key={order.id} className="card">
            {/* Order header */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
              <div>
                <span className="font-bold text-gray-900">Order #{order.id}</span>
                <span className="text-gray-400 text-sm ml-3">{new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-bold text-indigo-600 text-lg">₹{order.total_amount.toFixed(2)}</span>
                <StatusBadge status={order.status} />
              </div>
            </div>

            {order.payment_ref && (
              <p className="text-xs text-gray-500 mb-3">Payment ref: <span className="font-mono">{order.payment_ref}</span></p>
            )}

            {/* Vendor sub-orders summary */}
            <div className="flex flex-wrap gap-2 mb-3">
              {order.vendor_orders.map(vo => (
                <span key={vo.id} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                  🏪 {vo.vendor_name} — <StatusBadge status={vo.status} />
                </span>
              ))}
            </div>

            {/* Toggle detail */}
            <button
              onClick={() => toggle(order.id)}
              className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-800"
            >
              {expanded[order.id] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              {expanded[order.id] ? 'Hide details' : 'View details'}
            </button>

            {expanded[order.id] && (
              <div className="mt-4 space-y-4">
                {order.vendor_orders.map(vo => (
                  <div key={vo.id} className="border border-gray-100 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-3">
                      <p className="font-semibold text-gray-800">🏪 {vo.vendor_name}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">₹{vo.subtotal.toFixed(2)}</span>
                        <StatusBadge status={vo.status} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      {vo.items.map(item => (
                        <div key={item.id} className="flex justify-between text-sm">
                          <span className="text-gray-700">{item.product_name} <span className="text-gray-400">×{item.quantity}</span></span>
                          <span className="font-medium">₹{item.subtotal.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
