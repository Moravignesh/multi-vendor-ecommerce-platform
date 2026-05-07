import { useState, useEffect } from 'react'
import { getMyProducts, createProduct, updateProduct, deleteProduct, getCategories } from '../../api/products'
import { Plus, Edit2, Trash2, X, Package } from 'lucide-react'
import toast from 'react-hot-toast'
import StatusBadge from '../../components/StatusBadge'

const EMPTY_FORM = { name: '', description: '', price: '', stock: '', category_id: '', is_active: true }

export default function VendorProducts() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [editId, setEditId] = useState(null)
  const [saving, setSaving] = useState(false)

  const load = async () => {
    try {
      const [p, c] = await Promise.all([getMyProducts(), getCategories()])
      setProducts(p.data)
      setCategories(c.data)
    } catch { toast.error('Failed to load') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const openCreate = () => { setForm(EMPTY_FORM); setEditId(null); setShowModal(true) }
  const openEdit = (p) => {
    setForm({ name: p.name, description: p.description || '', price: p.price, stock: p.stock, category_id: p.category_id || '', is_active: p.is_active })
    setEditId(p.id)
    setShowModal(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) { toast.error('Product name is required'); return }
    if (Number(form.price) <= 0) { toast.error('Price must be > 0'); return }
    if (Number(form.stock) < 0) { toast.error('Stock cannot be negative'); return }

    setSaving(true)
    try {
      const payload = { ...form, price: Number(form.price), stock: Number(form.stock), category_id: form.category_id || null }
      if (editId) {
        await updateProduct(editId, payload)
        toast.success('Product updated!')
      } else {
        await createProduct(payload)
        toast.success('Product created!')
      }
      setShowModal(false)
      load()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Save failed')
    } finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this product?')) return
    try { await deleteProduct(id); toast.success('Product deleted'); load() }
    catch (err) { toast.error(err.response?.data?.detail || 'Delete failed') }
  }

  if (loading) return <div className="flex items-center justify-center min-h-96"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600" /></div>

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold">My Products</h1>
          <p className="text-gray-500 text-sm">{products.length} products listed</p>
        </div>
        <button onClick={openCreate} className="btn-success flex items-center gap-2">
          <Plus size={16} /> Add Product
        </button>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-20">
          <Package size={64} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 text-lg mb-4">No products yet. Start listing!</p>
          <button onClick={openCreate} className="btn-success">Add Your First Product</button>
        </div>
      ) : (
        <div className="card overflow-hidden p-0">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {['Product', 'Category', 'Price', 'Stock', 'Status', 'Actions'].map(h => (
                  <th key={h} className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products.map(p => (
                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">{p.name}</p>
                    <p className="text-xs text-gray-500 truncate max-w-xs">{p.description || '—'}</p>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{p.category_obj?.name || '—'}</td>
                  <td className="px-4 py-3 font-bold text-gray-900">₹{p.price.toFixed(2)}</td>
                  <td className="px-4 py-3">
                    <span className={`font-medium ${p.stock === 0 ? 'text-red-500' : p.stock < 5 ? 'text-amber-500' : 'text-green-600'}`}>{p.stock}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`badge ${p.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {p.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(p)} className="text-indigo-600 hover:text-indigo-800"><Edit2 size={15} /></button>
                      <button onClick={() => handleDelete(p.id)} className="text-red-500 hover:text-red-700"><Trash2 size={15} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-lg font-bold">{editId ? 'Edit Product' : 'Add New Product'}</h2>
              <button onClick={() => setShowModal(false)}><X size={20} className="text-gray-400 hover:text-gray-600" /></button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
                <input className="input" required value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g., iPhone 15 Pro" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea className="input h-24 resize-none" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Describe your product..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹) *</label>
                  <input className="input" type="number" step="0.01" min="0.01" required value={form.price} onChange={e => setForm(p => ({ ...p, price: e.target.value }))} placeholder="999.00" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stock *</label>
                  <input className="input" type="number" min="0" required value={form.stock} onChange={e => setForm(p => ({ ...p, stock: e.target.value }))} placeholder="100" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select className="input" value={form.category_id} onChange={e => setForm(p => ({ ...p, category_id: e.target.value }))}>
                  <option value="">Select category</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              {editId && (
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.is_active} onChange={e => setForm(p => ({ ...p, is_active: e.target.checked }))} className="w-4 h-4 rounded text-indigo-600" />
                  <span className="text-sm font-medium text-gray-700">Active (visible to customers)</span>
                </label>
              )}
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving} className="btn-success flex-1">{saving ? 'Saving...' : editId ? 'Update Product' : 'Create Product'}</button>
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
