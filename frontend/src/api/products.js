import api from './axios'

export const getProducts = (params) => api.get('/products', { params })
export const getProduct = (id) => api.get(`/products/${id}`)
export const createProduct = (data) => api.post('/products', data)
export const updateProduct = (id, data) => api.put(`/products/${id}`, data)
export const deleteProduct = (id) => api.delete(`/products/${id}`)
export const getCategories = () => api.get('/products/categories')
export const createCategory = (name) => api.post(`/products/categories?name=${encodeURIComponent(name)}`)
export const getMyProducts = () => api.get('/vendor/products')
export const addReview = (productId, data) => api.post(`/products/${productId}/reviews`, data)
export const getReviews = (productId) => api.get(`/products/${productId}/reviews`)
