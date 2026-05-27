import request from './request'

// 用户管理
export const getUsers = (params?: { page?: number; limit?: number }) =>
  request.get('/admin/users', { params })

export const updateUserStatus = (id: string, status: 'active' | 'disabled') =>
  request.put(`/admin/users/${id}/status`, { status })

// 统计
export const getAdminStats = () =>
  request.get('/admin/stats')

// 场馆管理
export const createVenue = (data: { name: string; city?: string; address?: string; latitude?: number; longitude?: number }) =>
  request.post('/admin/venues', data)

export const updateVenue = (id: string, data: { name?: string; city?: string; address?: string }) =>
  request.put(`/admin/venues/${id}`, data)

export const deleteVenue = (id: string) =>
  request.delete(`/admin/venues/${id}`)

// 偶像管理
export const createIdol = (data: { name: string; group_name?: string; avatar_url?: string; debut_date?: string }) =>
  request.post('/admin/idols', data)

export const updateIdol = (id: string, data: { name?: string; group_name?: string; avatar_url?: string }) =>
  request.put(`/admin/idols/${id}`, data)

export const deleteIdol = (id: string) =>
  request.delete(`/admin/idols/${id}`)
