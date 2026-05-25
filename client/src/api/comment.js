import request from '../utils/request'

export const addComment = (data) => request.post('/comments', data)

export const getProductComments = (productId) => request.get(`/comments/product/${productId}`)

export const getMyComments = () => request.get('/comments/my')
