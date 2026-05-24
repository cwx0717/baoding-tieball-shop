import request from '../utils/request'

export const getMerchantProducts = () => request.get('/merchant/products')

export const addProduct = (data) => request.post('/merchant/products', data)

export const updateProduct = (id, data) => request.put(`/merchant/products/${id}`, data)

export const deleteProduct = (id) => request.delete(`/merchant/products/${id}`)

export const getMerchantOrders = (params) => request.get('/merchant/orders', { params })

export const shipOrder = (id) => request.put(`/merchant/orders/${id}/ship`)

export const getStockAlert = () => request.get('/merchant/stock-alert')

export const getSalesStatistics = () => request.get('/merchant/sales-statistics')
