import { useState, useCallback } from 'react'
import { Card, FloatingBubble, InfiniteScroll, Tag, Toast, SwipeAction, Dialog, Empty, Image, Button } from 'antd-mobile'
import { MultiImageViewer } from 'antd-mobile/es/components/image-viewer/image-viewer'
import { AddOutline, LikeOutline, MessageOutline, PictureOutline } from 'antd-mobile-icons'
import { getDiaryList, createDiary, deleteDiary } from '../../api/diary'
import { likeDiary, unlikeDiary } from '../../api/social'
import { uploadBatch } from '../../api/upload'
import { useDemoCheck } from '../../components/DemoBanner'

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
  like_count?: number
  comment_count?: number
  is_liked?: boolean
}

export default function DiaryPage() {
  const [diaries, setDiaries] = useState<Diary[]>([])
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(1)
  const [loaded, setLoaded] = useState(false)
  const [showPublish, setShowPublish] = useState(false)
  const [publishTitle, setPublishTitle] = useState('')
  const [publishContent, setPublishContent] = useState('')
  const [publishImages, setPublishImages] = useState<string[]>([])
  const [publishTags, setPublishTags] = useState('')
  const [publishing, setPublishing] = useState(false)
  const [viewerVisible, setViewerVisible] = useState(false)
  const [viewerImages, setViewerImages] = useState<string[]>([])
  const [viewerIndex, setViewerIndex] = useState(0)
  const { checkAction } = useDemoCheck()

  const loadMore = useCallback(async () => {
    try {
      const res: any = await getDiaryList({ page, limit: 10 })
      const items = res?.data?.items || res?.data || []
      setDiaries((prev) => [...prev, ...items])
      setHasMore(items.length >= 10)
      setPage((p) => p + 1)
    } catch {
      if (!loaded) { setDiaries([]); setHasMore(false) }
    } finally { setLoaded(true) }
  }, [page, loaded])

  const handleDelete = async (id: string) => {
    const confirmed = await Dialog.confirm({ content: '确定删除这条日记吗？' })
    if (confirmed) {
      try { await deleteDiary(id); setDiaries((prev) => prev.filter((d) => d.id !== id)); Toast.show({ content: '已删除', position: 'center' }) } catch {}
    }
  }

  const handleLike = async (diary: Diary) => {
    if (!checkAction('点赞')) return
    try {
      if (diary.is_liked) { await unlikeDiary(diary.id) } else { await likeDiary(diary.id) }
      setDiaries((prev) => prev.map((d) => d.id === diary.id ? { ...d, is_liked: !d.is_liked, like_count: d.is_liked ? (d.like_count || 1) - 1 : (d.like_count || 0) + 1 } : d))
    } catch {}
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return
    if (publishImages.length + files.length > 9) {
      Toast.show({ content: '最多上传9张图片', position: 'center' })
      return
    }
    try {
      const res: any = await uploadBatch(Array.from(files))
      const urls = res?.data?.urls || res?.data || []
      setPublishImages((prev) => [...prev, ...(Array.isArray(urls) ? urls : [urls])])
    } catch {
      Toast.show({ content: '上传失败', position: 'center' })
    }
  }

  const handlePublish = async () => {
    if (!checkAction('发布')) return
    if (!publishTitle || !publishContent) {
      Toast.show({ content: '请填写标题和内容', position: 'center' })
      return
    }
    setPublishing(true)
    try {
      await createDiary({
        title: publishTitle,
        content: publishContent,
        images: publishImages,
        tags: publishTags ? publishTags.split(',').map((t) => t.trim()) : [],
      })
      Toast.show({ content: '发布成功', position: 'center' })
      setShowPublish(false)
      setPublishTitle('')
      setPublishContent('')
      setPublishImages([])
      setPublishTags('')
      setPage(1)
      setDiaries([])
      setLoaded(false)
    } catch {
      Toast.show({ content: '发布失败', position: 'center' })
    } finally {
      setPublishing(false)
    }
  }

  const openImageViewer = (images: string[], index: number) => {
    setViewerImages(images)
    setViewerIndex(index)
    setViewerVisible(true)
  }

  const parseTags = (tags: string): string[] => { try { return JSON.parse(tags) } catch { return [] } }
  const parseImages = (images: string): string[] => { try { return JSON.parse(images) } catch { return [] } }

  return (
    <div className="p-4 pb-20">
      <h1 className="text-xl font-bold text-gray-800 mb-4">日记广场</h1>

      {loaded && diaries.length === 0 ? (
        <Empty description="还没有日记，快去写一篇吧" />
      ) : (
        <div className="space-y-3">
          {diaries.map((diary) => {
            const tags = parseTags(diary.tags)
            const images = parseImages(diary.images)
            return (
              <SwipeAction key={diary.id} rightActions={[{ key: 'delete', text: '删除', color: 'danger', onClick: () => handleDelete(diary.id) }]}>
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
                        <div key={i} className="relative w-16 h-16 flex-shrink-0 cursor-pointer" onClick={() => openImageViewer(images, i)}>
                          <Image src={img} className="w-16 h-16 rounded-lg" fit="cover" />
                          {i === 2 && images.length > 3 && (
                            <div className="absolute inset-0 bg-black/40 rounded-lg flex items-center justify-center text-white text-xs">
                              +{images.length - 3}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <div className="flex gap-1">
                      {tags.map((tag) => <Tag key={tag} color="primary" fill="outline" className="!text-xs">{tag}</Tag>)}
                    </div>
                    <div className="flex items-center gap-4 text-gray-400 text-xs">
                      <span className="flex items-center gap-1 cursor-pointer" onClick={() => handleLike(diary)}>
                        <LikeOutline className={diary.is_liked ? 'text-red-500' : ''} /> {diary.like_count || 0}
                      </span>
                      <span className="flex items-center gap-1"><MessageOutline /> {diary.comment_count || 0}</span>
                    </div>
                  </div>
                </Card>
              </SwipeAction>
            )
          })}
        </div>
      )}

      <InfiniteScroll loadMore={loadMore} hasMore={hasMore} />

      <MultiImageViewer
        visible={viewerVisible}
        onClose={() => setViewerVisible(false)}
        images={viewerImages}
        defaultIndex={viewerIndex}
      />

      {/* 发布弹窗 */}
      {showPublish && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end" onClick={() => setShowPublish(false)}>
          <div className="bg-white w-full rounded-t-2xl p-4 max-h-[80vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">发布日记</h2>
              <span className="text-gray-400 cursor-pointer" onClick={() => setShowPublish(false)}>✕</span>
            </div>
            <div className="space-y-3">
              <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" placeholder="标题" value={publishTitle} onChange={(e) => setPublishTitle(e.target.value)} />
              <textarea className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm h-24 resize-none" placeholder="内容" value={publishContent} onChange={(e) => setPublishContent(e.target.value)} />
              <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" placeholder="标签（逗号分隔）" value={publishTags} onChange={(e) => setPublishTags(e.target.value)} />
              <div>
                <div className="text-sm text-gray-600 mb-2">图片（最多9张）</div>
                <div className="flex gap-2 flex-wrap">
                  {publishImages.map((img, i) => (
                    <div key={i} className="relative w-16 h-16">
                      <Image src={img} className="w-16 h-16 rounded-lg" fit="cover" />
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full text-xs flex items-center justify-center cursor-pointer"
                        onClick={() => setPublishImages((prev) => prev.filter((_, j) => j !== i))}>✕</span>
                    </div>
                  ))}
                  {publishImages.length < 9 && (
                    <label className="w-16 h-16 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer">
                      <PictureOutline className="text-gray-400 text-xl" />
                      <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageUpload} />
                    </label>
                  )}
                </div>
              </div>
              <Button block color="primary" size="large" className="!rounded-lg" loading={publishing} onClick={handlePublish}>
                发布
              </Button>
            </div>
          </div>
        </div>
      )}

      <FloatingBubble
        style={{ '--initial-position-bottom': '80px', '--initial-position-right': '20px', '--edge-distance': '20px' } as any}
        onClick={() => {
          if (!checkAction('发布')) return
          setShowPublish(true)
        }}
      >
        <AddOutline fontSize={24} />
      </FloatingBubble>
    </div>
  )
}
