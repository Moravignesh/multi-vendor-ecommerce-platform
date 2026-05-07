import { useState, useEffect } from 'react'
import { getAllUsers, toggleUser } from '../../api/orders'
import toast from 'react-hot-toast'
import { UserX, UserCheck } from 'lucide-react'

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  const load = () => {
    getAllUsers()
      .then(r => setUsers(r.data))
      .catch(() => toast.error('Failed to load users'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleToggle = async (id) => {
    try { await toggleUser(id); toast.success('User status updated'); load() }
    catch { toast.error('Failed') }
  }

  const filtered = users.filter(u =>
    filter === 'all' ? true : u.role === filter
  )

  const roleColor = { admin: 'bg-purple-100 text-purple-700', vendor: 'bg-emerald-100 text-emerald-700', customer: 'bg-indigo-100 text-indigo-700' }

  if (loading) return (
    <div className="flex items-center justify-center min-h-96">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600" />
    </div>
  )

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">All Users</h1>
          <p className="text-gray-500 text-sm">{users.length} registered users</p>
        </div>
        <div className="flex gap-2">
          {['all', 'admin', 'vendor', 'customer'].map(r => (
            <button key={r} onClick={() => setFilter(r)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors ${filter === r ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
              {r}
            </button>
          ))}
        </div>
      </div>

      <div className="card overflow-hidden p-0">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              {['User', 'Email', 'Role', 'Status', 'Joined', 'Actions'].map(h => (
                <th key={h} className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map(u => (
              <tr key={u.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center font-bold text-indigo-700 text-sm">
                      {u.full_name.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-medium text-gray-900">{u.full_name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">{u.email}</td>
                <td className="px-4 py-3">
                  <span className={`badge ${roleColor[u.role]} capitalize`}>{u.role}</span>
                </td>
                <td className="px-4 py-3">
                  <span className={`badge ${u.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                    {u.is_active ? 'Active' : 'Disabled'}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-500">
                  {u.created_at ? new Date(u.created_at).toLocaleDateString('en-IN') : '—'}
                </td>
                <td className="px-4 py-3">
                  {u.role !== 'admin' && (
                    <button
                      onClick={() => handleToggle(u.id)}
                      className={`flex items-center gap-1 text-sm px-3 py-1 rounded-lg transition-colors ${u.is_active ? 'bg-red-100 text-red-600 hover:bg-red-200' : 'bg-green-100 text-green-700 hover:bg-green-200'}`}
                    >
                      {u.is_active ? <><UserX size={13} /> Disable</> : <><UserCheck size={13} /> Enable</>}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <div className="text-center py-12 text-gray-400">No users found</div>}
      </div>
    </div>
  )
}
