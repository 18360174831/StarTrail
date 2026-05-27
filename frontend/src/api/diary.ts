import request from './request'

export const getDiaryList = (params?: { page?: number; limit?: number }) =>
  request.get('/diary', { params })

export const getDiaryDetail = (id: string) =>
  request.get(`/diary/${id}`)

export const createDiary = (data: { content: string; images?: string[]; tags?: string[] }) =>
  request.post('/diary', data)

export const updateDiary = (id: string, data: { content?: string; images?: string[]; tags?: string[] }) =>
  request.put(`/diary/${id}`, data)

export const deleteDiary = (id: string) =>
  request.delete(`/diary/${id}`)

export const likeDiary = (id: string) =>
  request.post(`/diary/${id}/like`)

export const commentDiary = (id: string, content: string) =>
  request.post(`/diary/${id}/comment`, { content })
