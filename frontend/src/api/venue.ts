import request from './request'

export const getVenues = (params?: { city?: string; page?: number; limit?: number }) =>
  request.get('/venues', { params })

export const getVenueDetail = (id: string) =>
  request.get(`/venues/${id}`)

export const createVenue = (data: { name: string; city?: string; address?: string; latitude?: number; longitude?: number }) =>
  request.post('/venues', data)

export const checkinVenue = (id: string, data?: { note?: string }) =>
  request.post(`/venues/${id}/checkin`, data)

export const getMyCheckins = () =>
  request.get('/venues/checkins/me')

export const getVenueStats = () =>
  request.get('/venues/stats/me')
