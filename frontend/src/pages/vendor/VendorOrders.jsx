import { useState, useEffect } from 'react'
import { getVendorOrders, updateVendorOrderStatus } from '../../api/orders'
import StatusBadge from '../../components/StatusBadge'
import { Package, ChevronDown, ChevronUp } from 'lucide-react'
import toast from 'react-hot-toast'

const NEXT_STATUS = { paid: 'shipped', shipped: 'delivered' }
const NEXT_LABEL = { paid: '🚚 Mark Shipped', shipped: '✅ Mark Delivered' }

export default function VendorOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState({})
  const [updating, setUpdating] = useState(null)

  const load = () => {
    getVendorOrders()
      .then(r => setOrders(r.data))
      .catch(() => toast.error('Failed to load orders'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const toggle = (id) => setExpanded(p => ({ ...p, [id]: !p[id] }))

  const handleStatusUpdate = async (voId, currentStatus) => {
    const nextStatus = NEXT_STATUS[currentStatus]
    if (!nextStatus) return
    setUpdating(voId)
    try {
      await updateVendorOrderStatus(voId, nextStatus)
      toast.success(`Order marked as ${nextStatus}`)
      load()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Update failed')
    } finally { setUpdating(null) }
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-96">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600" />
    </div>
  )

  if (orders.length === 0) return (
    <div className="max-w-2xl mx-auto px-4 py-20 text-center">
      <Package size={64} className="mx-auto text-gray-300 mb-4" />
      <h2 className="text-xl font-bold text-gray-700 mb-2">No orders yet</h2>
      <p className="text-gray-500">Orders for your products will appear here once customers purchase them.</p>
    </div>
  )

  const grouped = { pending: [], paid: [], shipped: [], delivered: [], cancelled: [] }
  orders.forEach(o => { if (grouped[o.status]) grouped[o.status].push(o) })

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">My Orders</h1>
        <p className="text-gray-500 text-sm">{orders.length} total vendor sub-orders</p>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Pending', count: grouped.pending.length, color: 'yellow' },
          { label: 'Paid (to ship)', count: grouped.paid.length, color: 'blue' },
          { label: 'Shipped', count: grouped.shipped.length, color: 'purple' },
          { label: 'Delivered', count: grouped.delivered.length, color: 'green' },
        ].map(s => (
          <div key={s.label} className="card text-center py-4">
            <p className={`text-3xl font-bold ${s.color === 'yellow' ? 'text-yellow-600' : s.color === 'blue' ? 'text-blue-600' : s.color === 'purple' ? 'text-purple-600' : 'text-green-600'}`}>{s.count}</p>
            <p className="text-gray-500 text-sm">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        {orders.map(order => (
          <div key={order.id} className="card">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-bold text-gray-900">Sub-Order #{order.id}</p>
                <p className="text-xs text-gray-500">Master Order #{order.order_id} · Customer #{order.customer_id}</p>
                <p className="text-xs text-gray-400">{new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                <span className="font-bold text-emerald-600 text-lg">₹{order.subtotal.toFixed(2)}</span>
                <StatusBadge status={order.status} />
                {NEXT_STATUS[order.status] && (
                  <button
                    onClick={() => handleStatusUpdate(order.id, order.status)}
                    disabled={updating === order.id}
                    className="btn-primary text-sm py-1.5 px-3"
                  >
                    {updating === order.id ? 'Updating...' : NEXT_LABEL[order.status]}
                  </button>
                )}
              </div>
            </div>

            <button onClick={() => toggle(order.id)} className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-800 mt-3">
              {expanded[order.id] ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
              {expanded[order.id] ? 'Hide items' : `View items (${order.items.length})`}
            </button>

            {expanded[order.id] && (
              <div className="mt-4 border-t border-gray-100 pt-4 space-y-2">
                {order.items.map(item => (
                  <div key={item.id} className="flex justify-between items-center text-sm">
                    <div>
                      <span className="font-medium text-gray-800">{item.product_name}</span>
                      <span className="text-gray-400 ml-2">× {item.quantity}</span>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">₹{item.subtotal.toFixed(2)}</p>
                      <p className="text-xs text-gray-400">₹{item.price_at_purchase} each</p>
                    </div>
                  </div>
                ))}
                <div className="pt-2 border-t border-gray-100 flex justify-between font-bold text-sm">
                  <span>Subtotal</span>
                  <span className="text-emerald-600">₹{order.subtotal.toFixed(2)}</span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
