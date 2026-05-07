import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getProduct, addReview } from '../api/products'
import { addToCart } from '../api/cart'
import { ShoppingCart, Star, ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../contexts/AuthContext'
import StatusBadge from '../components/StatusBadge'

export default function ProductDetail({ onCartUpdate }) {
  const { id } = useParams()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [qty, setQty] = useState(1)
  const [review, setReview] = useState({ rating: 5, comment: '' })
  const { isCustomer } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    getProduct(id).then(r => { setProduct(r.data); setLoading(false) }).catch(() => navigate('/products'))
  }, [id])

  const handleAddToCart = async () => {
    try {
      await addToCart(product.id, qty)
      toast.success('Added to cart!')
      onCartUpdate?.()
    } catch (err) { toast.error(err.response?.data?.detail || 'Failed') }
  }

  const handleReview = async (e) => {
    e.preventDefault()
    try {
      await addReview(product.id, review)
      toast.success('Review submitted!')
      const r = await getProduct(id)
      setProduct(r.data)
    } catch (err) { toast.error(err.response?.data?.detail || 'Failed to submit review') }
  }

  if (loading) return <div className="flex items-center justify-center min-h-96"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" /></div>
  if (!product) return null

  const avgRating = product.reviews?.length
    ? (product.reviews.reduce((s, r) => s + r.rating, 0) / product.reviews.length).toFixed(1)
    : null

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6">
        <ArrowLeft size={18} /> Back
      </button>

      <div className="grid md:grid-cols-2 gap-8 mb-8">
        <div className="bg-gradient-to-br from-indigo-50 to-purple-100 rounded-xl h-80 flex items-center justify-center text-8xl">
          {product.category_obj?.name === 'Electronics' ? '📱' : product.category_obj?.name === 'Clothing' ? '👗' : product.category_obj?.name === 'Books' ? '📚' : '🛍️'}
        </div>
        <div className="flex flex-col">
          {product.category_obj && <span className="badge bg-indigo-50 text-indigo-700 w-fit mb-3">{product.category_obj.name}</span>}
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{product.name}</h1>
          <p className="text-gray-500 text-sm mb-1">Sold by <span className="font-medium text-gray-700">{product.vendor?.full_name}</span></p>
          {avgRating && (
            <div className="flex items-center gap-1 mb-3">
              {Array.from({ length: 5 }, (_, i) => (
                <Star key={i} size={16} fill={i < Math.round(avgRating) ? '#f59e0b' : 'none'} stroke={i < Math.round(avgRating) ? '#f59e0b' : '#d1d5db'} />
              ))}
              <span className="text-sm text-gray-600">{avgRating} ({product.reviews.length} reviews)</span>
            </div>
          )}
          <p className="text-gray-600 mb-4 flex-1">{product.description || 'No description provided.'}</p>
          <div className="text-3xl font-bold text-gray-900 mb-2">₹{product.price.toFixed(2)}</div>
          <p className="text-sm text-gray-500 mb-4">{product.stock > 0 ? `${product.stock} in stock` : <span className="text-red-500">Out of stock</span>}</p>

          {isCustomer && product.stock > 0 && (
            <div className="flex gap-3 items-center">
              <div className="flex items-center border rounded-lg overflow-hidden">
                <button onClick={() => setQty(q => Math.max(1, q - 1))} className="px-3 py-2 hover:bg-gray-50">-</button>
                <span className="px-4 py-2 font-medium">{qty}</span>
                <button onClick={() => setQty(q => Math.min(product.stock, q + 1))} className="px-3 py-2 hover:bg-gray-50">+</button>
              </div>
              <button onClick={handleAddToCart} className="btn-primary flex items-center gap-2 flex-1 justify-center">
                <ShoppingCart size={16} /> Add to Cart
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Reviews */}
      <div className="card">
        <h2 className="text-lg font-bold mb-4">Reviews ({product.reviews?.length || 0})</h2>
        {isCustomer && (
          <form onSubmit={handleReview} className="mb-6 p-4 bg-gray-50 rounded-lg">
            <p className="font-medium mb-2">Write a review</p>
            <div className="flex gap-1 mb-3">
              {[1,2,3,4,5].map(r => (
                <button key={r} type="button" onClick={() => setReview(p => ({ ...p, rating: r }))}>
                  <Star size={24} fill={r <= review.rating ? '#f59e0b' : 'none'} stroke={r <= review.rating ? '#f59e0b' : '#d1d5db'} />
                </button>
              ))}
            </div>
            <textarea className="input mb-3 h-20 resize-none" placeholder="Share your thoughts..." value={review.comment}
              onChange={e => setReview(p => ({ ...p, comment: e.target.value }))} />
            <button type="submit" className="btn-primary text-sm">Submit Review</button>
          </form>
        )}
        {product.reviews?.length === 0 ? (
          <p className="text-gray-500">No reviews yet. Be the first!</p>
        ) : (
          <div className="space-y-4">
            {product.reviews.map(r => (
              <div key={r.id} className="border-b border-gray-100 pb-4 last:border-0">
                <div className="flex gap-0.5 mb-1">
                  {[1,2,3,4,5].map(s => <Star key={s} size={14} fill={s <= r.rating ? '#f59e0b' : 'none'} stroke={s <= r.rating ? '#f59e0b' : '#d1d5db'} />)}
                </div>
                <p className="text-gray-700 text-sm">{r.comment || 'No comment'}</p>
                <p className="text-xs text-gray-400 mt-1">{new Date(r.created_at).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
