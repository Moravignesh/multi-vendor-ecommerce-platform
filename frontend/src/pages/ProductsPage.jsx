import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { getProducts, getCategories } from '../api/products'
import { addToCart } from '../api/cart'
import ProductCard from '../components/ProductCard'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../contexts/AuthContext'

export default function ProductsPage({ onCartUpdate }) {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [searchParams, setSearchParams] = useSearchParams()
  const [filters, setFilters] = useState({
    category_id: searchParams.get('category_id') || '',
    min_price: '', max_price: '',
  })
  const { isCustomer } = useAuth()

  useEffect(() => {
    getCategories().then(r => setCategories(r.data))
  }, [])

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    try {
      const params = { ...(search && { search }), ...(filters.category_id && { category_id: filters.category_id }), ...(filters.min_price && { min_price: filters.min_price }), ...(filters.max_price && { max_price: filters.max_price }) }
      const { data } = await getProducts(params)
      setProducts(data)
    } catch { toast.error('Failed to load products') }
    finally { setLoading(false) }
  }, [search, filters])

  useEffect(() => { fetchProducts() }, [fetchProducts])

  const handleAddToCart = async (productId) => {
    if (!isCustomer) { toast.error('Please login as a customer to add to cart'); return }
    try {
      await addToCart(productId, 1)
      toast.success('Added to cart!')
      onCartUpdate?.()
    } catch (err) { toast.error(err.response?.data?.detail || 'Failed to add to cart') }
  }

  const clearFilters = () => { setFilters({ category_id: '', min_price: '', max_price: '' }); setSearch('') }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            className="input pl-10"
            placeholder="Search products..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <select className="input w-auto" value={filters.category_id}
            onChange={e => setFilters(p => ({ ...p, category_id: e.target.value }))}>
            <option value="">All Categories</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <input className="input w-28" type="number" placeholder="Min ₹" value={filters.min_price}
            onChange={e => setFilters(p => ({ ...p, min_price: e.target.value }))} />
          <input className="input w-28" type="number" placeholder="Max ₹" value={filters.max_price}
            onChange={e => setFilters(p => ({ ...p, max_price: e.target.value }))} />
          {(filters.category_id || filters.min_price || filters.max_price || search) && (
            <button onClick={clearFilters} className="btn-secondary flex items-center gap-1">
              <X size={14} /> Clear
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="card animate-pulse h-72 bg-gray-100" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-5xl mb-4">🔍</p>
          <p className="text-gray-500 text-lg">No products found</p>
          <button onClick={clearFilters} className="mt-4 btn-secondary">Clear filters</button>
        </div>
      ) : (
        <>
          <p className="text-sm text-gray-500 mb-4">{products.length} products found</p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map(p => <ProductCard key={p.id} product={p} onAddToCart={handleAddToCart} />)}
          </div>
        </>
      )}
    </div>
  )
}
