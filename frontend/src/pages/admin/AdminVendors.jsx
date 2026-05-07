import { useState, useEffect } from 'react'
import { getAllVendors, approveVendor, rejectVendor } from '../../api/orders'
import { CheckCircle, XCircle, Clock } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AdminVendors() {
  const [vendors, setVendors] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  const load = () => {
    getAllVendors()
      .then(r => setVendors(r.data))
      .catch(() => toast.error('Failed to load vendors'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleApprove = async (id) => {
    try { await approveVendor(id); toast.success('Vendor approved!'); load() }
    catch { toast.error('Failed') }
  }
  const handleReject = async (id) => {
    try { await rejectVendor(id); toast.success('Vendor rejected'); load() }
    catch { toast.error('Failed') }
  }

  const filtered = vendors.filter(v =>
    filter === 'all' ? true : filter === 'pending' ? !v.is_approved : v.is_approved
  )

  if (loading) return (
    <div className="flex items-center justify-center min-h-96">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600" />
    </div>
  )

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Vendor Management</h1>
          <p className="text-gray-500 text-sm">{vendors.filter(v => !v.is_approved).length} pending approval</p>
        </div>
        <div className="flex gap-2">
          {['all', 'pending', 'approved'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors capitalize ${filter === f ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-500">No vendors found</div>
      ) : (
        <div className="card overflow-hidden p-0">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                {['Vendor', 'Email', 'Joined', 'Status', 'Actions'].map(h => (
                  <th key={h} className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map(v => (
                <tr key={v.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center font-bold text-emerald-700 text-sm">
                        {v.full_name.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium text-gray-900">{v.full_name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{v.email}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {v.created_at ? new Date(v.created_at).toLocaleDateString('en-IN') : '—'}
                  </td>
                  <td className="px-4 py-3">
                    {v.is_approved ? (
                      <span className="badge bg-green-100 text-green-700 flex items-center gap-1 w-fit">
                        <CheckCircle size={12} /> Approved
                      </span>
                    ) : (
                      <span className="badge bg-amber-100 text-amber-700 flex items-center gap-1 w-fit">
                        <Clock size={12} /> Pending
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      {!v.is_approved && (
                        <button onClick={() => handleApprove(v.id)}
                          className="flex items-center gap-1 text-sm bg-green-100 text-green-700 hover:bg-green-200 px-3 py-1 rounded-lg transition-colors">
                          <CheckCircle size={14} /> Approve
                        </button>
                      )}
                      {v.is_approved && (
                        <button onClick={() => handleReject(v.id)}
                          className="flex items-center gap-1 text-sm bg-red-100 text-red-600 hover:bg-red-200 px-3 py-1 rounded-lg transition-colors">
                          <XCircle size={14} /> Revoke
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
