import request from './request'

export const login = (username: string, password: string) =>
  request.post('/auth/login', { username, password })

export const register = (username: string, password: string) =>
  request.post('/auth/register', { username, password })

export const getProfile = () => request.get('/user/profile')
