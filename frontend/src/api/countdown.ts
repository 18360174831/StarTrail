import request from './request'

export const getCountdownList = () =>
  request.get('/countdowns')

export const createCountdown = (data: { title: string; targetDate: string; icon?: string }) =>
  request.post('/countdowns', data)

export const updateCountdown = (id: string, data: { title?: string; targetDate?: string; icon?: string }) =>
  request.put(`/countdowns/${id}`, data)

export const deleteCountdown = (id: string) =>
  request.delete(`/countdowns/${id}`)
