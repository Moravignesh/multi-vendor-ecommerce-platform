export default function StatusBadge({ status }) {
  const styles = {
    pending:   'bg-yellow-100 text-yellow-800',
    paid:      'bg-blue-100 text-blue-800',
    shipped:   'bg-purple-100 text-purple-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  }
  return (
    <span className={`badge ${styles[status] || 'bg-gray-100 text-gray-800'} capitalize`}>
      {status}
    </span>
  )
}
