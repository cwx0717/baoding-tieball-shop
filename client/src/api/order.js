import request from '../utils/request'

export const createOrder = (data) => request.post('/orders', data)

export const getOrderList = (params) => request.get('/orders', { params })

export const getOrderDetail = (id) => request.get(`/orders/${id}`)

export const cancelOrder = (id) => request.put(`/orders/${id}/cancel`)

export const confirmReceipt = (id) => request.put(`/orders/${id}/confirm`)
