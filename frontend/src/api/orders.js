import api from './axios'

export const checkout = () => api.post('/orders')
export const getMyOrders = () => api.get('/orders/my')
export const getOrder = (id) => api.get(`/orders/my/${id}`)
export const payOrder = (id, simulate_success = true) => api.post(`/orders/${id}/pay`, { simulate_success })

// Vendor
export const getVendorOrders = () => api.get('/orders/vendor/my-orders')
export const updateVendorOrderStatus = (vendor_order_id, status) =>
  api.put(`/orders/vendor/${vendor_order_id}/status`, { status })

// Admin
export const getAllOrders = () => api.get('/admin/orders')
export const getAdminStats = () => api.get('/admin/stats')
export const getAllVendors = () => api.get('/admin/vendors')
export const getAllUsers = () => api.get('/admin/users')
export const approveVendor = (id) => api.put(`/admin/vendors/${id}/approve`)
export const rejectVendor = (id) => api.put(`/admin/vendors/${id}/reject`)
export const toggleUser = (id) => api.put(`/admin/users/${id}/toggle-active`)
export const getAllAdminProducts = () => api.get('/admin/products')
