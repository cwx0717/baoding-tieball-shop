import request from '../utils/request'

export const login = (data) => request.post('/auth/login', data)

export const register = (data) => request.post('/auth/register', data)

export const getUserInfo = () => request.get('/auth/userinfo')

export const updateUserInfo = (data) => request.put('/auth/userinfo', data)
