import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'
import { Store } from 'lucide-react'

export default function Register() {
  const [form, setForm] = useState({ email: '', full_name: '', password: '', role: 'customer' })
  const { register, loading } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return }
    try {
      await register(form)
      toast.success('Account created! Please log in.')
      if (form.role === 'vendor') toast('Vendor accounts require admin approval before you can sell.', { icon: 'ℹ️' })
      navigate('/login')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Registration failed')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 text-indigo-600 font-bold text-2xl">
            <Store size={32} /> ShopHub
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mt-4">Create account</h1>
          <p className="text-gray-500">Join thousands of buyers and sellers</p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input className="input" required value={form.full_name}
                onChange={e => setForm(p => ({ ...p, full_name: e.target.value }))} placeholder="John Doe" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input className="input" type="email" required value={form.email}
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="you@example.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input className="input" type="password" required value={form.password}
                onChange={e => setForm(p => ({ ...p, password: e.target.value }))} placeholder="Min 6 characters" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">I want to...</label>
              <div className="grid grid-cols-2 gap-3">
                {[{ value: 'customer', label: '🛍️ Shop', desc: 'Buy products' }, { value: 'vendor', label: '🏪 Sell', desc: 'List & sell products' }].map(opt => (
                  <label key={opt.value} className={`border-2 rounded-lg p-3 cursor-pointer transition-all ${form.role === opt.value ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-gray-300'}`}>
                    <input type="radio" name="role" value={opt.value} className="sr-only"
                      checked={form.role === opt.value} onChange={e => setForm(p => ({ ...p, role: e.target.value }))} />
                    <p className="font-medium">{opt.label}</p>
                    <p className="text-xs text-gray-500">{opt.desc}</p>
                  </label>
                ))}
              </div>
              {form.role === 'vendor' && (
                <p className="text-xs text-amber-600 mt-2 bg-amber-50 p-2 rounded-lg">⚠️ Vendor accounts require admin approval before you can start selling.</p>
              )}
            </div>
            <button type="submit" className="btn-primary w-full" disabled={loading}>
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>
        </div>

        <p className="text-center mt-4 text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="text-indigo-600 font-medium hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
