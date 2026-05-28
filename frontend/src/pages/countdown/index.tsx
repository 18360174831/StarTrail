import { useEffect, useState } from 'react'
import { Card, FloatingBubble, Dialog, Toast, Empty, SwipeAction, Input, Image, DatePicker } from 'antd-mobile'
import { AddOutline, ClockCircleOutline, PictureOutline } from 'antd-mobile-icons'
import { getCountdownList, createCountdown, deleteCountdown } from '../../api/countdown'
import { uploadFile } from '../../api/upload'
import { useDemoCheck } from '../../components/DemoBanner'

interface Countdown {
  id: string
  title: string
  target_date: string
  icon?: string
  color?: string
  cover_url?: string
  is_pinned: number
}

export default function CountdownPage() {
  const [countdowns, setCountdowns] = useState<Countdown[]>([])
  const [showAdd, setShowAdd] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newDate, setNewDate] = useState('')
  const [newCover, setNewCover] = useState('')
  const [showDatePicker, setShowDatePicker] = useState(false)
  const { checkAction } = useDemoCheck()

  useEffect(() => { loadCountdowns() }, [])

  const loadCountdowns = async () => {
    try {
      const res: any = await getCountdownList()
      setCountdowns(res?.data || [])
    } catch {}
  }

  const getDaysLeft = (targetDate: string) => {
    const target = new Date(targetDate)
    const now = new Date()
    return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  }

  const getProgress = (targetDate: string) => {
    const days = getDaysLeft(targetDate)
    if (days <= 0) return 100
    if (days >= 365) return 10
    return Math.max(5, 100 - (days / 365) * 100)
  }

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const res: any = await uploadFile(file)
      setNewCover(res?.data?.url || res?.data || '')
    } catch {
      Toast.show({ content: '上传失败', position: 'center' })
    }
  }

  const handleAdd = async () => {
    if (!checkAction('创建倒数日')) return
    if (!newTitle || !newDate) {
      Toast.show({ content: '请填写完整信息', position: 'center' })
      return
    }
    try {
      await createCountdown({ title: newTitle, target_date: newDate, cover_image: newCover || undefined })
      Toast.show({ content: '创建成功', position: 'center' })
      setShowAdd(false)
      setNewTitle('')
      setNewDate('')
      setNewCover('')
      loadCountdowns()
    } catch {
      Toast.show({ content: '创建失败', position: 'center' })
    }
  }

  const handleDelete = async (id: string) => {
    if (!checkAction('删除倒数日')) return
    const confirmed = await Dialog.confirm({ content: '确定删除这个倒数日吗？' })
    if (confirmed) {
      try {
        await deleteCountdown(id)
        setCountdowns((prev) => prev.filter((c) => c.id !== id))
        Toast.show({ content: '已删除', position: 'center' })
      } catch {}
    }
  }

  const handleDateConfirm = (val: Date) => {
    const dateStr = val.toISOString().split('T')[0]
    setNewDate(dateStr)
    setShowDatePicker(false)
  }

  return (
    <div className="p-4 pb-20">
      <h1 className="text-xl font-bold text-gray-800 mb-4">倒数日</h1>

      {countdowns.length === 0 ? (
        <Empty description="还没有倒数日，快去创建一个吧" />
      ) : (
        <div className="space-y-3">
          {countdowns.map((cd) => {
            const daysLeft = getDaysLeft(cd.target_date)
            const progress = getProgress(cd.target_date)
            return (
              <SwipeAction key={cd.id} rightActions={[{ key: 'delete', text: '删除', color: 'danger', onClick: () => handleDelete(cd.id) }]}>
                <Card className="!rounded-xl active:scale-[0.98] transition-transform overflow-hidden">
                  {cd.cover_url && (
                    <div className="h-24 -mx-4 -mt-4 mb-3 overflow-hidden relative">
                      <Image src={cd.cover_url} className="w-full h-24" fit="cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                    </div>
                  )}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <ClockCircleOutline className="text-purple-500 text-lg" />
                      <span className="font-medium text-gray-800">{cd.title}</span>
                    </div>
                    <span className="text-xs text-gray-400">{cd.target_date}</span>
                  </div>
                  <div className="flex items-end justify-between">
                    <div>
                      <span className="text-3xl font-bold text-purple-600">{daysLeft > 0 ? daysLeft : 0}</span>
                      <span className="text-sm text-gray-500 ml-1">天</span>
                    </div>
                    <span className="text-xs text-gray-400">{daysLeft <= 0 ? '已到达' : `还有 ${daysLeft} 天`}</span>
                  </div>
                  <div className="mt-3 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full transition-all" style={{ width: `${progress}%` }} />
                  </div>
                </Card>
              </SwipeAction>
            )
          })}
        </div>
      )}

      {/* 添加倒数日弹窗 */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end" onClick={() => setShowAdd(false)}>
          <div className="bg-white w-full rounded-t-2xl p-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">新建倒数日</h2>
              <span className="text-gray-400 cursor-pointer text-xl" onClick={() => setShowAdd(false)}>✕</span>
            </div>
            <div className="space-y-4">
              <div>
                <div className="text-sm text-gray-600 mb-1">标题</div>
                <Input placeholder="输入标题" value={newTitle} onChange={setNewTitle} />
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-1">目标日期</div>
                <div
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 cursor-pointer"
                  onClick={() => setShowDatePicker(true)}
                >
                  {newDate || '点击选择日期'}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-1">封面图（可选）</div>
                <label className="flex items-center gap-2 cursor-pointer">
                  {newCover ? (
                    <Image src={newCover} className="w-20 h-20 rounded-lg" fit="cover" />
                  ) : (
                    <div className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                      <PictureOutline className="text-gray-400 text-xl" />
                    </div>
                  )}
                  <input type="file" accept="image/*" className="hidden" onChange={handleCoverUpload} />
                </label>
              </div>
              <button
                className="w-full bg-purple-600 text-white py-3 rounded-xl text-base font-medium active:bg-purple-700"
                onClick={handleAdd}
              >
                创建
              </button>
            </div>
          </div>
        </div>
      )}

      <DatePicker
        visible={showDatePicker}
        onClose={() => setShowDatePicker(false)}
        onConfirm={handleDateConfirm}
        title="选择日期"
      />

      <FloatingBubble
        style={{ '--initial-position-bottom': '80px', '--initial-position-right': '20px', '--edge-distance': '20px' } as any}
        onClick={() => {
          if (!checkAction('创建倒数日')) return
          setShowAdd(true)
        }}
      >
        <AddOutline fontSize={24} />
      </FloatingBubble>
    </div>
  )
}
