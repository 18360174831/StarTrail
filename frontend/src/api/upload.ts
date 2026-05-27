import request from './request'

export const uploadFile = (file: File) => {
  const formData = new FormData()
  formData.append('file', file)
  return request.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

export const uploadBatch = (files: File[]) => {
  const formData = new FormData()
  files.forEach((file) => formData.append('files', file))
  return request.post('/upload/batch', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}
