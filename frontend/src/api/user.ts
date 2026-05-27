import request from './request'

export const login = (username: string, password: string) =>
  request.post('/auth/login', { username, password })

export const register = (username: string, password: string) =>
  request.post('/auth/register', { username, password, confirmPassword: password, nickname: username })

export const getProfile = () => request.get('/auth/me')

export const updateProfile = (data: { nickname?: string; avatar_url?: string; bio?: string }) =>
  request.put('/auth/profile', data)
