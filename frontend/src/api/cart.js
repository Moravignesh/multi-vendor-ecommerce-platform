import api from './axios'

export const getCart = () => api.get('/cart')
export const addToCart = (product_id, quantity = 1) => api.post('/cart/items', { product_id, quantity })
export const updateCartItem = (item_id, quantity) => api.put(`/cart/items/${item_id}`, { quantity })
export const removeCartItem = (item_id) => api.delete(`/cart/items/${item_id}`)
export const clearCart = () => api.delete('/cart')
