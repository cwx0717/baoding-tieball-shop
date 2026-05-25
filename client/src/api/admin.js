import request from '../utils/request'

export const getAllUsers = () => request.get('/admin/users')

export const updateUser = (id, data) => request.put(`/admin/users/${id}`, data)

export const getPendingProducts = () => request.get('/admin/products/pending')

export const approveProduct = (id) => request.put(`/admin/products/${id}/approve`)

export const rejectProduct = (id) => request.put(`/admin/products/${id}/reject`)

export const getAllOrders = (params) => request.get('/admin/orders', { params })

export const getCategories = () => request.get('/admin/categories')

export const addCategory = (data) => request.post('/admin/categories', data)

export const updateCategory = (id, data) => request.put(`/admin/categories/${id}`, data)
