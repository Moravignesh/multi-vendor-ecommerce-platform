import { useState, useEffect } from 'react'
import { getAllOrders } from '../../api/orders'
import StatusBadge from '../../components/StatusBadge'
import { ChevronDown, ChevronUp } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AdminOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState({})
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    getAllOrders()
      .then(r => setOrders(r.data))
      .catch(() => toast.error('Failed to load orders'))
      .finally(() => setLoading(false))
  }, [])

  const toggle = (id) => setExpanded(p => ({ ...p, [id]: !p[id] }))

  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter)

  if (loading) return (
    <div className="flex items-center justify-center min-h-96">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600" />
    </div>
  )

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">All Orders</h1>
          <p className="text-gray-500 text-sm">{orders.length} total platform orders</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {['all', 'pending', 'paid', 'shipped', 'delivered', 'cancelled'].map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors capitalize ${filter === s ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-500">No orders found</div>
      ) : (
        <div className="space-y-4">
          {filtered.map(order => (
            <div key={order.id} className="card">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-bold text-gray-900">Order #{order.id}</p>
                  <p className="text-xs text-gray-500">Customer #{order.customer_id}</p>
                  {order.payment_ref && <p className="text-xs font-mono text-gray-400">{order.payment_ref}</p>}
                  <p className="text-xs text-gray-400 mt-1">
                    {order.created_at ? new Date(order.created_at).toLocaleString('en-IN') : ''}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className="font-bold text-lg text-indigo-600">₹{order.total_amount.toFixed(2)}</span>
                  <StatusBadge status={order.status} />
                  <p className="text-xs text-gray-500">{order.vendor_orders.length} vendor sub-order(s)</p>
                </div>
              </div>

              {/* Vendor breakdown */}
              <div className="flex flex-wrap gap-2 mt-3">
                {order.vendor_orders.map(vo => (
                  <span key={vo.id} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full flex items-center gap-1">
                    🏪 {vo.vendor_name} — <StatusBadge status={vo.status} />
                  </span>
                ))}
              </div>

              <button onClick={() => toggle(order.id)} className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-800 mt-3">
                {expanded[order.id] ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                {expanded[order.id] ? 'Hide details' : 'View line items'}
              </button>

              {expanded[order.id] && (
                <div className="mt-4 space-y-3">
                  {order.vendor_orders.map(vo => (
                    <div key={vo.id} className="border border-gray-100 rounded-lg p-3">
                      <div className="flex justify-between mb-2">
                        <p className="font-medium text-sm text-gray-800">🏪 {vo.vendor_name}</p>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold">₹{vo.subtotal.toFixed(2)}</span>
                          <StatusBadge status={vo.status} />
                        </div>
                      </div>
                      {vo.items.map(item => (
                        <div key={item.id} className="flex justify-between text-sm text-gray-600">
                          <span>{item.product_name} × {item.quantity}</span>
                          <span>₹{item.subtotal.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
