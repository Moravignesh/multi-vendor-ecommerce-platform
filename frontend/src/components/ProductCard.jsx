import { Link } from 'react-router-dom'
import { ShoppingCart, Star } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

export default function ProductCard({ product, onAddToCart }) {
  const { isCustomer } = useAuth()

  const stars = product.avg_rating
    ? Array.from({ length: 5 }, (_, i) => i < Math.round(product.avg_rating))
    : []

  return (
    <div className="card hover:shadow-md transition-shadow flex flex-col">
      {/* Image placeholder */}
      <div className="w-full h-48 bg-gradient-to-br from-indigo-50 to-purple-100 rounded-lg mb-4 flex items-center justify-center text-5xl">
        {product.category_obj?.name === 'Electronics' ? '📱'
          : product.category_obj?.name === 'Clothing' ? '👗'
          : product.category_obj?.name === 'Books' ? '📚'
          : product.category_obj?.name === 'Sports' ? '⚽'
          : product.category_obj?.name === 'Beauty' ? '💄'
          : '🛍️'}
      </div>

      <div className="flex-1 flex flex-col">
        {product.category_obj && (
          <span className="badge bg-indigo-50 text-indigo-700 mb-2 w-fit">{product.category_obj.name}</span>
        )}
        <Link to={`/products/${product.id}`} className="font-semibold text-gray-900 hover:text-indigo-600 transition-colors mb-1 line-clamp-2">
          {product.name}
        </Link>
        <p className="text-xs text-gray-500 mb-2">by {product.vendor?.full_name}</p>

        {stars.length > 0 && (
          <div className="flex gap-0.5 mb-2">
            {stars.map((filled, i) => (
              <Star key={i} size={14} fill={filled ? '#f59e0b' : 'none'} stroke={filled ? '#f59e0b' : '#d1d5db'} />
            ))}
            <span className="text-xs text-gray-500 ml-1">{product.avg_rating}</span>
          </div>
        )}

        <div className="mt-auto pt-3 flex items-center justify-between">
          <div>
            <span className="text-xl font-bold text-gray-900">₹{product.price.toFixed(2)}</span>
            <p className="text-xs text-gray-500">{product.stock} in stock</p>
          </div>
          {isCustomer && (
            <button
              onClick={() => onAddToCart(product.id)}
              disabled={product.stock === 0}
              className="btn-primary text-sm py-2 px-3 flex items-center gap-1 disabled:opacity-50"
            >
              <ShoppingCart size={14} />
              {product.stock === 0 ? 'Out of stock' : 'Add'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
