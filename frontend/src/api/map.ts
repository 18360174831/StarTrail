import request from './request'

export const getVenues = (params?: { city?: string; page?: number; limit?: number }) =>
  request.get('/venues', { params })

export const getVenueDetail = (id: string) =>
  request.get(`/venues/${id}`)

export const getFootprints = () =>
  request.get('/venues/footprints/me')

export const addFootprint = (data: { venue_id: string; visit_date: string; note?: string }) =>
  request.post('/venues/footprints', data)

export const deleteFootprint = (id: string) =>
  request.delete(`/venues/footprints/${id}`)

export const getFootprintStats = () =>
  request.get('/venues/stats/me')
