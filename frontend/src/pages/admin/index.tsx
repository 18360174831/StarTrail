import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, Tag, Toast, Tabs, Button, Dialog, Empty, Grid } from 'antd-mobile'
import {} from 'antd-mobile-icons'
import { getUsers, updateUserStatus, getAdminStats } from '../../api/admin'
import { getDiaryList, deleteDiary } from '../../api/diary'

interface User {
  id: string
  username: string
  nickname: string
  role: string
  status: string
  created_at: string
}

interface Stats {
  totalUsers: number
  totalDiaries: number
  activeUsers: number
}

export default function AdminPage() {
  const navigate = useNavigate()
  const [users, setUsers] = useState<User[]>([])
  const [diaries, setDiaries] = useState<any[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [activeTab, setActiveTab] = useState('stats')

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    try {
      const [userRes, diaryRes, statsRes]: any[] = await Promise.all([
        getUsers().catch(() => ({ data: [] })),
        getDiaryList({ limit: 50 }).catch(() => ({ data: { items: [] } })),
        getAdminStats().catch(() => ({ data: null })),
      ])
      setUsers(userRes?.data || [])
      setDiaries(diaryRes?.data?.items || diaryRes?.data || [])
      setStats(statsRes?.data || null)
    } catch {}
  }

  const handleToggleStatus = async (user: User) => {
    const newStatus = user.status === 'active' ? 'disabled' : 'active'
    const confirmed = await Dialog.confirm({
      content: `确定${newStatus === 'disabled' ? '禁用' : '启用'}用户 ${user.nickname}？`
    })
    if (confirmed) {
      try {
        await updateUserStatus(user.id, newStatus)
        setUsers((prev) => prev.map((u) => u.id === user.id ? { ...u, status: newStatus } : u))
        Toast.show({ content: '操作成功', position: 'center' })
      } catch {
        Toast.show({ content: '操作失败', position: 'center' })
      }
    }
  }

  const handleDeleteDiary = async (id: string) => {
    const confirmed = await Dialog.confirm({ content: '确定删除这篇日记？' })
    if (confirmed) {
      try {
        await deleteDiary(id)
        setDiaries((prev) => prev.filter((d) => d.id !== id))
        Toast.show({ content: '已删除', position: 'center' })
      } catch {}
    }
  }

  return (
    <div className="p-4 pb-20">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-gray-800">管理后台</h1>
        <Button size="mini" fill="outline" onClick={() => navigate('/')}>返回首页</Button>
      </div>

      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <Tabs.Tab title="数据统计" key="stats">
          {stats ? (
            <div className="mt-4">
              <Grid columns={3} gap={8}>
                <Grid.Item>
                  <Card className="!rounded-xl text-center">
                    <div className="text-2xl font-bold text-purple-600">{stats.totalUsers}</div>
                    <div className="text-xs text-gray-500 mt-1">用户总数</div>
                  </Card>
                </Grid.Item>
                <Grid.Item>
                  <Card className="!rounded-xl text-center">
                    <div className="text-2xl font-bold text-blue-600">{stats.totalDiaries}</div>
                    <div className="text-xs text-gray-500 mt-1">日记总数</div>
                  </Card>
                </Grid.Item>
                <Grid.Item>
                  <Card className="!rounded-xl text-center">
                    <div className="text-2xl font-bold text-green-600">{stats.activeUsers}</div>
                    <div className="text-xs text-gray-500 mt-1">活跃用户</div>
                  </Card>
                </Grid.Item>
              </Grid>
            </div>
          ) : (
            <Empty description="暂无统计数据" />
          )}
        </Tabs.Tab>

        <Tabs.Tab title="用户管理" key="users">
          <div className="mt-4 space-y-2">
            {users.length === 0 ? (
              <Empty description="暂无用户" />
            ) : (
              users.map((user) => (
                <Card key={user.id} className="!rounded-xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-medium">
                        {user.nickname?.[0] || 'U'}
                      </div>
                      <div>
                        <div className="font-medium text-gray-800">{user.nickname}</div>
                        <div className="text-xs text-gray-400">@{user.username}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Tag color={user.role === 'admin' ? 'warning' : 'default'} fill="outline" className="!text-xs">
                        {user.role === 'admin' ? '管理员' : '用户'}
                      </Tag>
                      <Tag color={user.status === 'active' ? 'success' : 'danger'} fill="outline" className="!text-xs">
                        {user.status === 'active' ? '正常' : '禁用'}
                      </Tag>
                      {user.role !== 'admin' && (
                        <Button
                          size="mini"
                          color={user.status === 'active' ? 'danger' : 'primary'}
                          fill="outline"
                          onClick={() => handleToggleStatus(user)}
                        >
                          {user.status === 'active' ? '禁用' : '启用'}
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </Tabs.Tab>

        <Tabs.Tab title="内容管理" key="content">
          <div className="mt-4 space-y-2">
            {diaries.length === 0 ? (
              <Empty description="暂无日记" />
            ) : (
              diaries.map((diary) => (
                <Card key={diary.id} className="!rounded-xl">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-800 truncate">{diary.title}</div>
                      <div className="text-sm text-gray-500 truncate mt-1">{diary.content}</div>
                      <div className="text-xs text-gray-400 mt-1">
                        {diary.author_name} · {new Date(diary.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <Button size="mini" color="danger" fill="outline" onClick={() => handleDeleteDiary(diary.id)}>
                      删除
                    </Button>
                  </div>
                </Card>
              ))
            )}
          </div>
        </Tabs.Tab>
      </Tabs>
    </div>
  )
}
