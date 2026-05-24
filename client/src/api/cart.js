import request from '../utils/request'

export const getCartList = () => request.get('/cart')

export const addToCart = (data) => request.post('/cart', data)

export const updateCartItem = (id, data) => request.put(`/cart/${id}`, data)

export const deleteCartItem = (id) => request.delete(`/cart/${id}`)

export const clearCart = () => request.delete('/cart')
