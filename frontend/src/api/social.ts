import request from './request'

// 评论
export const getComments = (diaryId: string) =>
  request.get(`/social/comments/${diaryId}`)

export const addComment = (diaryId: string, content: string) =>
  request.post('/social/comments', { diary_id: diaryId, content })

export const deleteComment = (id: string) =>
  request.delete(`/social/comments/${id}`)

// 点赞
export const likeDiary = (diaryId: string) =>
  request.post(`/social/likes/${diaryId}`)

export const unlikeDiary = (diaryId: string) =>
  request.delete(`/social/likes/${diaryId}`)

export const checkLiked = (diaryId: string) =>
  request.get(`/social/likes/${diaryId}/check`)

// 关注
export const followUser = (userId: string) =>
  request.post(`/social/follow/${userId}`)

export const unfollowUser = (userId: string) =>
  request.delete(`/social/follow/${userId}`)

export const checkFollowing = (userId: string) =>
  request.get(`/social/is-following/${userId}`)

export const getFollowers = (userId: string) =>
  request.get(`/social/followers/${userId}`)

export const getFollowing = (userId: string) =>
  request.get(`/social/following/${userId}`)

// Feed
export const getFeed = (params?: { page?: number; limit?: number }) =>
  request.get('/social/feed', { params })
