import { useEffect, useState } from 'react'
import { Card, FloatingBubble, Dialog, Toast, Empty, SwipeAction, Modal, Input } from 'antd-mobile'
import { AddOutline, ClockCircleOutline } from 'antd-mobile-icons'
import { getCountdownList, createCountdown, deleteCountdown } from '../../api/countdown'

interface Countdown {
  id: string
  title: string
  target_date: string
  icon?: string
  color?: string
  is_pinned: number
}

export default function CountdownPage() {
  const [countdowns, setCountdowns] = useState<Countdown[]>([])
  const [showAdd, setShowAdd] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newDate, setNewDate] = useState('')

  useEffect(() => { loadCountdowns() }, [])

  const loadCountdowns = async () => {
    try {
      const res: any = await getCountdownList()
      setCountdowns(res?.data || [])
    } catch {
      Toast.show({ content: '加载失败', position: 'center' })
    }
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

  const handleAdd = async () => {
    if (!newTitle || !newDate) {
      Toast.show({ content: '请填写完整信息', position: 'center' })
      return
    }
    try {
      await createCountdown({ title: newTitle, target_date: newDate })
      Toast.show({ content: '创建成功', position: 'center' })
      setShowAdd(false)
      setNewTitle('')
      setNewDate('')
      loadCountdowns()
    } catch {
      Toast.show({ content: '创建失败', position: 'center' })
    }
  }

  const handleDelete = async (id: string) => {
    const confirmed = await Dialog.confirm({ content: '确定删除这个倒数日吗？' })
    if (confirmed) {
      await deleteCountdown(id)
      setCountdowns((prev) => prev.filter((c) => c.id !== id))
      Toast.show({ content: '已删除', position: 'center' })
    }
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
              <SwipeAction
                key={cd.id}
                rightActions={[{ key: 'delete', text: '删除', color: 'danger', onClick: () => handleDelete(cd.id) }]}
              >
                <Card className="!rounded-xl active:scale-[0.98] transition-transform">
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

      <Modal
        visible={showAdd}
        onClose={() => setShowAdd(false)}
        title="新建倒数日"
        content={
          <div className="space-y-4 py-2">
            <div>
              <div className="text-sm text-gray-600 mb-1">标题</div>
              <Input placeholder="输入标题" value={newTitle} onChange={setNewTitle} />
            </div>
            <div>
              <div className="text-sm text-gray-600 mb-1">目标日期</div>
              <Input placeholder="格式：2025-12-31" value={newDate} onChange={setNewDate} />
            </div>
          </div>
        }
        actions={[
          { key: 'cancel', text: '取消', onClick: () => setShowAdd(false) },
          { key: 'confirm', text: '创建', primary: true, onClick: handleAdd },
        ]}
      />

      <FloatingBubble
        style={{ '--initial-position-bottom': '80px', '--initial-position-right': '20px', '--edge-distance': '20px' } as any}
        onClick={() => setShowAdd(true)}
      >
        <AddOutline fontSize={24} />
      </FloatingBubble>
    </div>
  )
}
