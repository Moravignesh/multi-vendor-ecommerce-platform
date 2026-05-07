import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getCart, updateCartItem, removeCartItem, clearCart } from '../api/cart'
import { checkout, payOrder } from '../api/orders'
import { Trash2, ShoppingBag, CreditCard } from 'lucide-react'
import toast from 'react-hot-toast'

export default function CartPage({ onCartUpdate }) {
  const [cart, setCart] = useState(null)
  const [loading, setLoading] = useState(true)
  const [checkingOut, setCheckingOut] = useState(false)
  const navigate = useNavigate()

  const loadCart = async () => {
    try { const { data } = await getCart(); setCart(data) }
    catch { toast.error('Failed to load cart') }
    finally { setLoading(false) }
  }

  useEffect(() => { loadCart() }, [])

  const handleUpdate = async (itemId, qty) => {
    try { const { data } = await updateCartItem(itemId, qty); setCart(data); onCartUpdate?.() }
    catch (err) { toast.error(err.response?.data?.detail || 'Failed to update') }
  }

  const handleRemove = async (itemId) => {
    try { const { data } = await removeCartItem(itemId); setCart(data); onCartUpdate?.() }
    catch { toast.error('Failed to remove item') }
  }

  const handleCheckout = async (simulateSuccess = true) => {
    setCheckingOut(true)
    try {
      const { data: order } = await checkout()
      const { data: paidOrder } = await payOrder(order.id, simulateSuccess)
      onCartUpdate?.()
      setCart(null)
      if (simulateSuccess) {
        toast.success(`Order #${order.id} placed & paid! Ref: ${paidOrder.payment_ref}`)
        navigate('/orders')
      } else {
        toast.error('Payment failed! Order cancelled and stock restored.')
      }
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Checkout failed')
    } finally { setCheckingOut(false) }
  }

  // Group by vendor for visual splitting preview
  const vendorGroups = cart?.items?.reduce((acc, item) => {
    const key = item.vendor_id
    if (!acc[key]) acc[key] = { name: item.vendor_name, items: [] }
    acc[key].items.push(item)
    return acc
  }, {}) || {}

  if (loading) return <div className="flex items-center justify-center min-h-96"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" /></div>

  if (!cart || cart.items.length === 0) return (
    <div className="max-w-2xl mx-auto px-4 py-20 text-center">
      <ShoppingBag size={64} className="mx-auto text-gray-300 mb-4" />
      <h2 className="text-xl font-bold text-gray-700 mb-2">Your cart is empty</h2>
      <p className="text-gray-500 mb-6">Discover amazing products from our vendors</p>
      <button onClick={() => navigate('/products')} className="btn-primary">Browse Products</button>
    </div>
  )

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Shopping Cart ({cart.items.length} items)</h1>
      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          {Object.entries(vendorGroups).map(([vendorId, group]) => (
            <div key={vendorId} className="card">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
                <span className="text-emerald-600 font-medium text-sm">🏪 {group.name}</span>
                <span className="text-xs text-gray-400">(Vendor sub-order)</span>
              </div>
              <div className="space-y-4">
                {group.items.map(item => (
                  <div key={item.id} className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-indigo-50 rounded-lg flex items-center justify-center text-2xl flex-shrink-0">🛍️</div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{item.product_name}</p>
                      <p className="text-indigo-600 font-bold">₹{item.product_price.toFixed(2)}</p>
                      {item.stock_available < 5 && <p className="text-xs text-amber-600">Only {item.stock_available} left!</p>}
                    </div>
                    <div className="flex items-center border rounded-lg overflow-hidden">
                      <button onClick={() => handleUpdate(item.id, item.quantity - 1)} className="px-2 py-1 hover:bg-gray-50 text-sm">-</button>
                      <span className="px-3 py-1 text-sm">{item.quantity}</span>
                      <button onClick={() => handleUpdate(item.id, item.quantity + 1)} disabled={item.quantity >= item.stock_available}
                        className="px-2 py-1 hover:bg-gray-50 text-sm disabled:opacity-40">+</button>
                    </div>
                    <p className="font-bold text-gray-900 w-20 text-right">₹{item.subtotal.toFixed(2)}</p>
                    <button onClick={() => handleRemove(item.id)} className="text-gray-400 hover:text-red-500 transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-4">
          <div className="card sticky top-20">
            <h2 className="font-bold text-lg mb-4">Order Summary</h2>
            {Object.entries(vendorGroups).map(([id, g]) => (
              <div key={id} className="text-sm text-gray-600 flex justify-between mb-1">
                <span>{g.name}</span>
                <span>₹{g.items.reduce((s, i) => s + i.subtotal, 0).toFixed(2)}</span>
              </div>
            ))}
            <div className="border-t border-gray-100 mt-3 pt-3 flex justify-between font-bold text-lg">
              <span>Total</span>
              <span className="text-indigo-600">₹{cart.total.toFixed(2)}</span>
            </div>
            {Object.keys(vendorGroups).length > 1 && (
              <div className="mt-3 p-3 bg-blue-50 rounded-lg text-xs text-blue-700">
                <strong>📦 Order Splitting:</strong> Your cart has items from {Object.keys(vendorGroups).length} vendors. Each vendor will receive their own sub-order automatically.
              </div>
            )}
            <div className="mt-4 space-y-2">
              <button onClick={() => handleCheckout(true)} disabled={checkingOut} className="btn-primary w-full flex items-center justify-center gap-2">
                <CreditCard size={16} /> {checkingOut ? 'Processing...' : 'Pay Now (Simulate Success)'}
              </button>
              <button onClick={() => handleCheckout(false)} disabled={checkingOut} className="btn-danger w-full text-sm py-1.5">
                Simulate Payment Failure
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
