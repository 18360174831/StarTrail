import request from './request'

export const getNotifications = (params?: { page?: number; limit?: number }) =>
  request.get('/notifications', { params })

export const getUnreadCount = () =>
  request.get('/notifications/unread-count')

export const markAsRead = (id: string) =>
  request.put(`/notifications/${id}/read`)

export const markAllAsRead = () =>
  request.put('/notifications/read-all')
