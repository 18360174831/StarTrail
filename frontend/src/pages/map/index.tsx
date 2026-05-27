import { useEffect, useState } from 'react'
import { Card, Grid, Tag, Toast, Collapse, List, Empty } from 'antd-mobile'
import { EnvironmentOutline } from 'antd-mobile-icons'
import { getMyCheckins, getVenueStats } from '../../api/venue'

interface Checkin {
  id: string
  venue_name: string
  city: string
  note?: string
  created_at: string
}

interface Stats {
  totalCheckins: number
  totalVenues: number
  cityStats: { city: string; count: number }[]
}

export default function MapPage() {
  const [checkins, setCheckins] = useState<Checkin[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [activeTab, setActiveTab] = useState<'list' | 'stats'>('list')

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    try {
      const [checkinRes, statsRes]: any[] = await Promise.all([getMyCheckins(), getVenueStats()])
      setCheckins(checkinRes?.data || [])
      setStats(statsRes?.data || null)
    } catch {
      Toast.show({ content: '加载失败', position: 'center' })
    }
  }

  return (
    <div className="p-4 pb-20">
      <h1 className="text-xl font-bold text-gray-800 mb-4">我的足迹</h1>

      <div className="flex gap-2 mb-4">
        <Tag
          className="cursor-pointer !px-4 !py-1"
          color={activeTab === 'list' ? 'primary' : 'default'}
          fill={activeTab === 'list' ? 'solid' : 'outline'}
          onClick={() => setActiveTab('list')}
        >
          打卡记录
        </Tag>
        <Tag
          className="cursor-pointer !px-4 !py-1"
          color={activeTab === 'stats' ? 'primary' : 'default'}
          fill={activeTab === 'stats' ? 'solid' : 'outline'}
          onClick={() => setActiveTab('stats')}
        >
          统计
        </Tag>
      </div>

      {activeTab === 'list' ? (
        <div className="space-y-3">
          {checkins.length === 0 ? (
            <Card className="!rounded-xl text-center py-8 text-gray-400">
              <EnvironmentOutline className="text-3xl mb-2" />
              <div>还没有打卡记录</div>
            </Card>
          ) : (
            checkins.map((item) => (
              <Card key={item.id} className="!rounded-xl active:scale-[0.98] transition-transform">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-medium text-gray-800">{item.venue_name}</div>
                    {item.city && <div className="text-xs text-gray-500 mt-1">{item.city}</div>}
                  </div>
                  <Tag color="success" fill="outline" className="!text-xs">
                    {new Date(item.created_at).toLocaleDateString()}
                  </Tag>
                </div>
                {item.note && <div className="text-sm text-gray-600 mt-2">{item.note}</div>}
              </Card>
            ))
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {stats ? (
            <>
              <Card className="!rounded-xl">
                <Grid columns={2} gap={8}>
                  <Grid.Item>
                    <div className="text-center">
                      <div className="text-xl font-bold text-purple-600">{stats.totalCheckins || 0}</div>
                      <div className="text-xs text-gray-500">打卡次数</div>
                    </div>
                  </Grid.Item>
                  <Grid.Item>
                    <div className="text-center">
                      <div className="text-xl font-bold text-blue-600">{stats.totalVenues || 0}</div>
                      <div className="text-xs text-gray-500">场馆数</div>
                    </div>
                  </Grid.Item>
                </Grid>
              </Card>

              {stats.cityStats?.length > 0 && (
                <Collapse className="!rounded-xl overflow-hidden">
                  <Collapse.Panel key="cities" title="城市排行">
                    <List>
                      {stats.cityStats.map((item, i) => (
                        <List.Item key={item.city} extra={`${item.count} 次`}>
                          <span className="text-sm">{i + 1}. {item.city}</span>
                        </List.Item>
                      ))}
                    </List>
                  </Collapse.Panel>
                </Collapse>
              )}
            </>
          ) : (
            <Empty description="暂无统计数据" />
          )}
        </div>
      )}
    </div>
  )
}
