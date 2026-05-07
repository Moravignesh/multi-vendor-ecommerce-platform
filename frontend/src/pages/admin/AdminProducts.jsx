import { useState, useEffect } from 'react'
import { getAllAdminProducts } from '../../api/orders'
import toast from 'react-hot-toast'

export default function AdminProducts() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    getAllAdminProducts()
      .then(r => setProducts(r.data))
      .catch(() => toast.error('Failed to load products'))
      .finally(() => setLoading(false))
  }, [])

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.vendor?.full_name?.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return (
    <div className="flex items-center justify-center min-h-96">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600" />
    </div>
  )

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">All Products</h1>
          <p className="text-gray-500 text-sm">{products.length} total products</p>
        </div>
        <input
          className="input w-64"
          placeholder="Search by name or vendor..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className="card overflow-hidden p-0">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              {['Product', 'Vendor', 'Category', 'Price', 'Stock', 'Status'].map(h => (
                <th key={h} className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map(p => (
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <p className="font-medium text-gray-900">{p.name}</p>
                </td>
                <td className="px-4 py-3 text-sm text-emerald-700 font-medium">{p.vendor?.full_name}</td>
                <td className="px-4 py-3 text-sm text-gray-500">{p.category_obj?.name || '—'}</td>
                <td className="px-4 py-3 font-bold text-gray-900">₹{p.price.toFixed(2)}</td>
                <td className="px-4 py-3">
                  <span className={`font-medium ${p.stock === 0 ? 'text-red-500' : p.stock < 5 ? 'text-amber-500' : 'text-green-600'}`}>{p.stock}</span>
                </td>
                <td className="px-4 py-3">
                  <span className={`badge ${p.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {p.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-400">No products found</div>
        )}
      </div>
    </div>
  )
}
