import request from '../utils/request'

export const getProductList = (params) => request.get('/products', { params })

export const getProductDetail = (id) => request.get(`/products/${id}`)

export const getCategories = () => request.get('/categories')

export const getProductsByCategory = (categoryId) => request.get(`/categories/${categoryId}/products`)
