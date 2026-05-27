import request from './request'

export const getIdolList = (params?: { page?: number; limit?: number }) =>
  request.get('/idols', { params })

export const getIdolDetail = (id: string) =>
  request.get(`/idols/${id}`)

export const createIdol = (data: { name: string; group_name?: string; avatar_url?: string; debut_date?: string }) =>
  request.post('/idols', data)

export const updateIdol = (id: string, data: { name?: string; group_name?: string; avatar_url?: string; debut_date?: string }) =>
  request.put(`/idols/${id}`, data)

export const deleteIdol = (id: string) =>
  request.delete(`/idols/${id}`)
