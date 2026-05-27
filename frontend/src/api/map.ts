import request from './request'

export const getVenues = (params?: { province?: string; city?: string }) =>
  request.get('/venues', { params })

export const getFootprints = () =>
  request.get('/footprints')

export const addFootprint = (data: { venueId: string; visitDate: string; note?: string }) =>
  request.post('/footprints', data)

export const getFootprintStats = () =>
  request.get('/footprints/stats')
