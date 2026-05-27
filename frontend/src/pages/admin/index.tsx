import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, Tag, Toast, Tabs, Button, Empty, Grid } from 'antd-mobile'
import { getUsers, updateUserStatus, getAdminStats, createVenue, deleteVenue, createIdol, deleteIdol } from '../../api/admin'
import { getDiaryList, deleteDiary } from '../../api/diary'
import { getVenues } from '../../api/venue'
import { getIdolList } from '../../api/idol'

interface User { id: string; username: string; nickname: string; role: string; status: string; created_at: string }
interface Stats { totalUsers: number; totalDiaries: number; activeUsers: number; venues: number; idols: number; comments: number; likes: number }

export default function AdminPage() {
  const navigate = useNavigate()
  const [users, setUsers] = useState<User[]>([])
  const [diaries, setDiaries] = useState<any[]>([])
  const [venues, setVenues] = useState<any[]>([])
  const [idols, setIdols] = useState<any[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [activeTab, setActiveTab] = useState('stats')
  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    try {
      const [userRes, diaryRes, statsRes, venueRes, idolRes]: any[] = await Promise.all([
        getUsers().catch(() => ({ data: [] })),
        getDiaryList({ limit: 50 }).catch(() => ({ data: { items: [] } })),
        getAdminStats().catch(() => ({ data: null })),
        getVenues().catch(() => ({ data: { items: [] } })),
        getIdolList().catch(() => ({ data: { items: [] } })),
      ])
      setUsers(userRes?.data || [])
      setDiaries(diaryRes?.data?.items || diaryRes?.data || [])
      setStats(statsRes?.data || null)
      setVenues(venueRes?.data?.items || venueRes?.data || [])
      setIdols(idolRes?.data?.items || idolRes?.data || [])
    } catch {}
  }

  const handleToggleStatus = async (user: User) => {
    const newStatus = user.status === 'active' ? 'disabled' : 'active'
    if (!window.confirm(`确定${newStatus === 'disabled' ? '禁用' : '启用'}用户 ${user.nickname}？`)) return
    try {
      await updateUserStatus(user.id, newStatus)
      setUsers((prev) => prev.map((u) => u.id === user.id ? { ...u, status: newStatus } : u))
      Toast.show({ content: '操作成功', position: 'center' })
    } catch { Toast.show({ content: '操作失败', position: 'center' }) }
  }

  const handleDeleteDiary = async (id: string) => {
    if (!window.confirm('确定删除这篇日记？')) return
    try { await deleteDiary(id); setDiaries((prev) => prev.filter((d) => d.id !== id)); Toast.show({ content: '已删除', position: 'center' }) } catch {}
  }

  const handleAddVenue = async () => {
    const name = window.prompt('场馆名称')
    if (!name) return
    const city = window.prompt('城市') || ''
    const address = window.prompt('地址') || ''
    try {
      await createVenue({ name, city, address })
      Toast.show({ content: '添加成功', position: 'center' })
      loadData()
    } catch { Toast.show({ content: '添加失败', position: 'center' }) }
  }

  const handleDeleteVenue = async (id: string) => {
    if (!window.confirm('确定删除该场馆？')) return
    try { await deleteVenue(id); setVenues((prev) => prev.filter((v) => v.id !== id)); Toast.show({ content: '已删除', position: 'center' }) } catch {}
  }

  const handleAddIdol = async () => {
    const name = window.prompt('偶像名称')
    if (!name) return
    const group_name = window.prompt('团体名称（可选）') || ''
    try {
      await createIdol({ name, group_name })
      Toast.show({ content: '添加成功', position: 'center' })
      loadData()
    } catch { Toast.show({ content: '添加失败', position: 'center' }) }
  }

  const handleDeleteIdol = async (id: string) => {
    if (!window.confirm('确定删除该偶像？')) return
    try { await deleteIdol(id); setIdols((prev) => prev.filter((i) => i.id !== id)); Toast.show({ content: '已删除', position: 'center' }) } catch {}
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      <div style={{ background: 'white', padding: '12px 16px', borderBottom: '1px solid #eee', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h1 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0 }}>管理后台</h1>
        <button onClick={() => navigate('/')} style={{ border: '1px solid #ddd', borderRadius: '6px', padding: '4px 12px', background: 'white', fontSize: '13px' }}>返回首页</button>
      </div>

      <div style={{ padding: '0 16px' }}>
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <Tabs.Tab title="数据统计" key="stats">
            <div style={{ paddingTop: '16px' }}>
              {stats ? (
                <Grid columns={3} gap={8}>
                  <Grid.Item><Card className="!rounded-xl text-center"><div className="text-2xl font-bold text-purple-600">{stats.totalUsers}</div><div className="text-xs text-gray-500 mt-1">用户</div></Card></Grid.Item>
                  <Grid.Item><Card className="!rounded-xl text-center"><div className="text-2xl font-bold text-blue-600">{stats.totalDiaries}</div><div className="text-xs text-gray-500 mt-1">日记</div></Card></Grid.Item>
                  <Grid.Item><Card className="!rounded-xl text-center"><div className="text-2xl font-bold text-green-600">{stats.activeUsers}</div><div className="text-xs text-gray-500 mt-1">活跃</div></Card></Grid.Item>
                  <Grid.Item><Card className="!rounded-xl text-center"><div className="text-2xl font-bold text-orange-600">{stats.venues || 0}</div><div className="text-xs text-gray-500 mt-1">场馆</div></Card></Grid.Item>
                  <Grid.Item><Card className="!rounded-xl text-center"><div className="text-2xl font-bold text-pink-600">{stats.idols || 0}</div><div className="text-xs text-gray-500 mt-1">偶像</div></Card></Grid.Item>
                  <Grid.Item><Card className="!rounded-xl text-center"><div className="text-2xl font-bold text-cyan-600">{stats.comments || 0}</div><div className="text-xs text-gray-500 mt-1">评论</div></Card></Grid.Item>
                </Grid>
              ) : <Empty description="暂无统计数据" />}
            </div>
          </Tabs.Tab>

          <Tabs.Tab title="用户管理" key="users">
            <div style={{ paddingTop: '16px' }}>
              {users.length === 0 ? <Empty description="暂无用户" /> : users.map((user) => (
                <Card key={user.id} className="!rounded-xl" style={{ marginBottom: '8px' }}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-medium">{user.nickname?.[0] || user.username?.[0] || 'U'}</div>
                      <div><div className="font-medium text-gray-800">{user.nickname || user.username}</div><div className="text-xs text-gray-400">@{user.username}</div></div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Tag color={user.role === 'admin' ? 'warning' : 'default'} fill="outline" className="!text-xs">{user.role === 'admin' ? '管理员' : '用户'}</Tag>
                      <Tag color={user.status === 'active' ? 'success' : 'danger'} fill="outline" className="!text-xs">{user.status === 'active' ? '正常' : '禁用'}</Tag>
                      {user.role !== 'admin' && <Button size="mini" color={user.status === 'active' ? 'danger' : 'primary'} fill="outline" onClick={() => handleToggleStatus(user)}>{user.status === 'active' ? '禁用' : '启用'}</Button>}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </Tabs.Tab>

          <Tabs.Tab title="内容管理" key="content">
            <div style={{ paddingTop: '16px' }}>
              {diaries.length === 0 ? <Empty description="暂无日记" /> : diaries.map((diary) => (
                <Card key={diary.id} className="!rounded-xl" style={{ marginBottom: '8px' }}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-800 truncate">{diary.title}</div>
                      <div className="text-sm text-gray-500 truncate mt-1">{diary.content}</div>
                      <div className="text-xs text-gray-400 mt-1">{diary.author_name} · {new Date(diary.created_at).toLocaleDateString()}</div>
                    </div>
                    <Button size="mini" color="danger" fill="outline" onClick={() => handleDeleteDiary(diary.id)}>删除</Button>
                  </div>
                </Card>
              ))}
            </div>
          </Tabs.Tab>

          <Tabs.Tab title="场馆管理" key="venues">
            <div style={{ paddingTop: '16px' }}>
              <div className="flex justify-end mb-3">
                <Button size="small" color="primary" onClick={handleAddVenue}>+ 添加场馆</Button>
              </div>
              {venues.length === 0 ? <Empty description="暂无场馆" /> : venues.map((venue) => (
                <Card key={venue.id} className="!rounded-xl" style={{ marginBottom: '8px' }}>
                  <div className="flex items-start justify-between">
                    <div><div className="font-medium text-gray-800">{venue.name}</div><div className="text-xs text-gray-500 mt-1">{venue.city} {venue.address}</div></div>
                    <Button size="mini" color="danger" fill="outline" onClick={() => handleDeleteVenue(venue.id)}>删除</Button>
                  </div>
                </Card>
              ))}
            </div>
          </Tabs.Tab>

          <Tabs.Tab title="偶像管理" key="idols">
            <div style={{ paddingTop: '16px' }}>
              <div className="flex justify-end mb-3">
                <Button size="small" color="primary" onClick={handleAddIdol}>+ 添加偶像</Button>
              </div>
              {idols.length === 0 ? <Empty description="暂无偶像" /> : idols.map((idol) => (
                <Card key={idol.id} className="!rounded-xl" style={{ marginBottom: '8px' }}>
                  <div className="flex items-start justify-between">
                    <div><div className="font-medium text-gray-800">{idol.name}</div>{idol.group_name && <div className="text-xs text-gray-500 mt-1">{idol.group_name}</div>}</div>
                    <Button size="mini" color="danger" fill="outline" onClick={() => handleDeleteIdol(idol.id)}>删除</Button>
                  </div>
                </Card>
              ))}
            </div>
          </Tabs.Tab>
        </Tabs>
      </div>
    </div>
  )
}
