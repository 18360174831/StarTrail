import { useState, useCallback } from 'react'
import { Card, FloatingBubble, InfiniteScroll, Tag, Toast, SwipeAction, Dialog, Empty, Image } from 'antd-mobile'
import { AddOutline, LikeOutline, MessageOutline } from 'antd-mobile-icons'
import { getDiaryList, deleteDiary } from '../../api/diary'
import { likeDiary, unlikeDiary } from '../../api/social'

interface Diary {
  id: string
  title: string
  content: string
  images: string
  tags: string
  idol_name?: string
  author_name: string
  author_avatar?: string
  created_at: string
  likes_count?: number
  comments_count?: number
  is_liked?: boolean
}

export default function DiaryPage() {
  const [diaries, setDiaries] = useState<Diary[]>([])
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(1)

  const loadMore = useCallback(async () => {
    try {
      const res: any = await getDiaryList({ page, limit: 10 })
      const items = res?.data?.items || res?.data || []
      setDiaries((prev) => [...prev, ...items])
      setHasMore(items.length >= 10)
      setPage((p) => p + 1)
    } catch {
      Toast.show({ content: '加载失败', position: 'center' })
    }
  }, [page])

  const handleDelete = async (id: string) => {
    const confirmed = await Dialog.confirm({ content: '确定删除这条日记吗？' })
    if (confirmed) {
      await deleteDiary(id)
      setDiaries((prev) => prev.filter((d) => d.id !== id))
      Toast.show({ content: '已删除', position: 'center' })
    }
  }

  const handleLike = async (diary: Diary) => {
    try {
      if (diary.is_liked) {
        await unlikeDiary(diary.id)
      } else {
        await likeDiary(diary.id)
      }
      setDiaries((prev) =>
        prev.map((d) =>
          d.id === diary.id ? { ...d, is_liked: !d.is_liked } : d
        )
      )
    } catch {}
  }

  const parseTags = (tags: string): string[] => {
    try { return JSON.parse(tags) } catch { return [] }
  }

  const parseImages = (images: string): string[] => {
    try { return JSON.parse(images) } catch { return [] }
  }

  return (
    <div className="p-4 pb-20">
      <h1 className="text-xl font-bold text-gray-800 mb-4">日记广场</h1>

      {diaries.length === 0 && !hasMore ? (
        <Empty description="还没有日记，快去写一篇吧" />
      ) : (
        <div className="space-y-3">
          {diaries.map((diary) => {
            const tags = parseTags(diary.tags)
            const images = parseImages(diary.images)
            return (
              <SwipeAction
                key={diary.id}
                rightActions={[{ key: 'delete', text: '删除', color: 'danger', onClick: () => handleDelete(diary.id) }]}
              >
                <Card className="!rounded-xl active:scale-[0.98] transition-transform">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 text-sm font-medium">
                      {diary.author_name?.[0] || 'U'}
                    </div>
                    <span className="text-sm text-gray-700 font-medium">{diary.author_name}</span>
                    {diary.idol_name && <Tag color="primary" fill="outline" className="!text-xs">{diary.idol_name}</Tag>}
                  </div>
                  <div className="text-gray-800 text-sm font-medium mb-1">{diary.title}</div>
                  <div className="text-gray-600 text-sm leading-relaxed mb-2 line-clamp-3">{diary.content}</div>
                  {images.length > 0 && (
                    <div className="flex gap-2 mb-2 overflow-x-auto">
                      {images.slice(0, 3).map((img, i) => (
                        <Image key={i} src={img} className="w-16 h-16 rounded-lg" fit="cover" />
                      ))}
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <div className="flex gap-1">
                      {tags.map((tag) => (
                        <Tag key={tag} color="primary" fill="outline" className="!text-xs">{tag}</Tag>
                      ))}
                    </div>
                    <div className="flex items-center gap-4 text-gray-400 text-xs">
                      <span className="flex items-center gap-1 cursor-pointer" onClick={() => handleLike(diary)}>
                        <LikeOutline className={diary.is_liked ? 'text-red-500' : ''} />
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageOutline /> {diary.comments_count || 0}
                      </span>
                    </div>
                  </div>
                </Card>
              </SwipeAction>
            )
          })}
        </div>
      )}

      <InfiniteScroll loadMore={loadMore} hasMore={hasMore} />

      <FloatingBubble
        style={{ '--initial-position-bottom': '80px', '--initial-position-right': '20px', '--edge-distance': '20px' } as any}
        onClick={() => Toast.show({ content: '写日记功能开发中', position: 'center' })}
      >
        <AddOutline fontSize={24} />
      </FloatingBubble>
    </div>
  )
}
