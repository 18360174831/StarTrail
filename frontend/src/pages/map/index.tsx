import { useEffect, useState } from 'react'
import { Card, Grid, Tag, Toast, Collapse, List } from 'antd-mobile'
import { EnvironmentOutline } from 'antd-mobile-icons'
import { getFootprints, getFootprintStats } from '../../api/map'
import './index.css'

interface Footprint {
  id: string
  venueName: string
  city: string
  province: string
  visitDate: string
  note?: string
}

interface Stats {
  totalVenues: number
  totalProvinces: number
  totalCities: number
  provinceStats: { province: string; count: number }[]
  cityStats: { city: string; count: number }[]
}

export default function MapPage() {
  const [footprints, setFootprints] = useState<Footprint[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [activeTab, setActiveTab] = useState<'list' | 'stats'>('list')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [fpRes, statsRes] = await Promise.all([getFootprints(), getFootprintStats()])
      setFootprints((fpRes as any)?.data || [])
      setStats((statsRes as any)?.data || null)
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
          足迹列表
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
          {footprints.length === 0 ? (
            <Card className="!rounded-xl text-center py-8 text-gray-400">
              <EnvironmentOutline className="text-3xl mb-2" />
              <div>还没有打卡记录</div>
            </Card>
          ) : (
            footprints.map((fp) => (
              <Card key={fp.id} className="footprint-card !rounded-xl">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-medium text-gray-800">{fp.venueName}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {fp.province} · {fp.city}
                    </div>
                  </div>
                  <Tag color="success" fill="outline" className="!text-xs">
                    {fp.visitDate}
                  </Tag>
                </div>
                {fp.note && <div className="text-sm text-gray-600 mt-2">{fp.note}</div>}
              </Card>
            ))
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {stats && (
            <>
              <Card className="!rounded-xl">
                <Grid columns={3} gap={8}>
                  <Grid.Item>
                    <div className="text-center">
                      <div className="text-xl font-bold text-purple-600">{stats.totalVenues}</div>
                      <div className="text-xs text-gray-500">场馆</div>
                    </div>
                  </Grid.Item>
                  <Grid.Item>
                    <div className="text-center">
                      <div className="text-xl font-bold text-blue-600">{stats.totalProvinces}</div>
                      <div className="text-xs text-gray-500">省份</div>
                    </div>
                  </Grid.Item>
                  <Grid.Item>
                    <div className="text-center">
                      <div className="text-xl font-bold text-green-600">{stats.totalCities}</div>
                      <div className="text-xs text-gray-500">城市</div>
                    </div>
                  </Grid.Item>
                </Grid>
              </Card>

              <Collapse className="!rounded-xl overflow-hidden">
                <Collapse.Panel key="provinces" title="省份排行">
                  <List>
                    {stats.provinceStats.map((item, i) => (
                      <List.Item key={item.province} extra={`${item.count} 次`}>
                        <span className="text-sm">{i + 1}. {item.province}</span>
                      </List.Item>
                    ))}
                  </List>
                </Collapse.Panel>
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
            </>
          )}
        </div>
      )}
    </div>
  )
}
