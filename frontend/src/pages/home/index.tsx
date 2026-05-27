import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, Grid } from 'antd-mobile'
import { EditSOutline, LocationOutline, ClockCircleOutline, UserOutline } from 'antd-mobile-icons'
import { getDiaryList } from '../../api/diary'
import { getVenueStats } from '../../api/venue'
import { getCountdownList } from '../../api/countdown'

export default function HomePage() {
  const navigate = useNavigate()
  const [stats, setStats] = useState({ diaries: 0, venues: 0, countdowns: 0 })

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    try {
      const [diaryRes, venueRes, countdownRes]: any[] = await Promise.all([
        getDiaryList({ limit: 1 }),
        getVenueStats(),
        getCountdownList(),
      ])
      setStats({
        diaries: diaryRes?.data?.pagination?.total || 0,
        venues: venueRes?.data?.totalVenues || 0,
        countdowns: countdownRes?.data?.length || 0,
      })
    } catch {}
  }

  const quickActions = [
    { icon: <EditSOutline className="text-2xl text-purple-500" />, label: '写日记', path: '/diary' },
    { icon: <LocationOutline className="text-2xl text-blue-500" />, label: '足迹', path: '/map' },
    { icon: <ClockCircleOutline className="text-2xl text-orange-500" />, label: '倒数日', path: '/countdown' },
    { icon: <UserOutline className="text-2xl text-green-500" />, label: '我的', path: '/profile' },
  ]

  return (
    <div className="p-4 pb-20">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">StarTrail</h1>
        <p className="text-gray-500 text-sm mt-1">记录你的追星旅程</p>
      </div>

      <Card className="mb-4 !rounded-xl">
        <Grid columns={3} gap={8}>
          <Grid.Item>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{stats.diaries}</div>
              <div className="text-xs text-gray-500 mt-1">日记</div>
            </div>
          </Grid.Item>
          <Grid.Item>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.venues}</div>
              <div className="text-xs text-gray-500 mt-1">场馆</div>
            </div>
          </Grid.Item>
          <Grid.Item>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{stats.countdowns}</div>
              <div className="text-xs text-gray-500 mt-1">倒数日</div>
            </div>
          </Grid.Item>
        </Grid>
      </Card>

      <h2 className="text-lg font-semibold text-gray-700 mb-3">快捷入口</h2>
      <Grid columns={4} gap={12}>
        {quickActions.map((action) => (
          <Grid.Item key={action.path} onClick={() => navigate(action.path)}>
            <Card className="!rounded-xl text-center py-3 cursor-pointer active:bg-gray-50 transition-colors">
              {action.icon}
              <div className="text-xs text-gray-600 mt-1">{action.label}</div>
            </Card>
          </Grid.Item>
        ))}
      </Grid>
    </div>
  )
}
