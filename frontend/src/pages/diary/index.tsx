import { useState, useCallback } from 'react'
import { Card, FloatingBubble, InfiniteScroll, Tag, Toast, SwipeAction, Dialog, Empty } from 'antd-mobile'
import { AddOutline, LikeOutline, MessageOutline } from 'antd-mobile-icons'
import { getDiaryList, deleteDiary, likeDiary } from '../../api/diary'
import './index.css'

interface Diary {
  id: string
  content: string
  images: string[]
  tags: string[]
  createdAt: string
  likes: number
  comments: number
  isLiked: boolean
}

export default function DiaryPage() {
  const [diaries, setDiaries] = useState<Diary[]>([])
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(1)

  const loadMore = useCallback(async () => {
    try {
      const res = await getDiaryList({ page, limit: 10 }) as any
      const newDiaries = res?.data || []
      setDiaries((prev) => [...prev, ...newDiaries])
      setHasMore(newDiaries.length >= 10)
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

  const handleLike = async (id: string) => {
    await likeDiary(id)
    setDiaries((prev) =>
      prev.map((d) =>
        d.id === id ? { ...d, isLiked: !d.isLiked, likes: d.isLiked ? d.likes - 1 : d.likes + 1 } : d
      )
    )
  }

  return (
    <div className="p-4 pb-20">
      <h1 className="text-xl font-bold text-gray-800 mb-4">我的日记</h1>

      {diaries.length === 0 && !hasMore ? (
        <Empty description="还没有日记，快去写一篇吧" />
      ) : (
        <div className="space-y-3">
          {diaries.map((diary) => (
            <SwipeAction
              key={diary.id}
              rightActions={[
                {
                  key: 'delete',
                  text: '删除',
                  color: 'danger',
                  onClick: () => handleDelete(diary.id),
                },
              ]}
            >
              <Card className="diary-card !rounded-xl">
                <div className="text-gray-800 text-sm leading-relaxed mb-2 line-clamp-3">
                  {diary.content}
                </div>
                {diary.images?.length > 0 && (
                  <div className="flex gap-2 mb-2 overflow-x-auto">
                    {diary.images.slice(0, 3).map((img, i) => (
                      <img key={i} src={img} className="w-16 h-16 rounded-lg object-cover flex-shrink-0" />
                    ))}
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <div className="flex gap-1">
                    {diary.tags?.map((tag) => (
                      <Tag key={tag} color="primary" fill="outline" className="!text-xs">{tag}</Tag>
                    ))}
                  </div>
                  <div className="flex items-center gap-4 text-gray-400 text-xs">
                    <span className="flex items-center gap-1 cursor-pointer" onClick={() => handleLike(diary.id)}>
                      <LikeOutline className={diary.isLiked ? 'text-red-500' : ''} />
                      {diary.likes}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageOutline /> {diary.comments}
                    </span>
                  </div>
                </div>
              </Card>
            </SwipeAction>
          ))}
        </div>
      )}

      <InfiniteScroll loadMore={loadMore} hasMore={hasMore} />

      <FloatingBubble
        style={{
          '--initial-position-bottom': '80px',
          '--initial-position-right': '20px',
          '--edge-distance': '20px',
        }}
        onClick={() => Toast.show({ content: '写日记功能开发中', position: 'center' })}
      >
        <AddOutline fontSize={24} />
      </FloatingBubble>
    </div>
  )
}
