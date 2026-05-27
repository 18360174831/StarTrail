import request from './request'

export const getDiaryList = (params?: { page?: number; limit?: number; idol_id?: string }) =>
  request.get('/diaries', { params })

export const getDiaryDetail = (id: string) =>
  request.get(`/diaries/${id}`)

export const createDiary = (data: {
  title: string
  content: string
  idol_id?: string
  images?: string[]
  tags?: string[]
  visibility?: 'public' | 'private'
}) => request.post('/diaries', data)

export const updateDiary = (id: string, data: {
  title?: string
  content?: string
  idol_id?: string
  images?: string[]
  tags?: string[]
  visibility?: 'public' | 'private'
}) => request.put(`/diaries/${id}`, data)

export const deleteDiary = (id: string) =>
  request.delete(`/diaries/${id}`)
