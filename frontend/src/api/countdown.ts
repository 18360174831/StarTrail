import request from './request'

export const getCountdownList = () =>
  request.get('/countdowns')

export const createCountdown = (data: { title: string; target_date: string; icon?: string; color?: string; cover_image?: string; is_pinned?: boolean }) =>
  request.post('/countdowns', data)

export const updateCountdown = (id: string, data: { title?: string; target_date?: string; icon?: string; color?: string; cover_image?: string; is_pinned?: boolean }) =>
  request.put(`/countdowns/${id}`, data)

export const deleteCountdown = (id: string) =>
  request.delete(`/countdowns/${id}`)
