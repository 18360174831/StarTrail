import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { TabBar } from 'antd-mobile'
import {
  AppOutline,
  UnorderedListOutline,
  LocationOutline,
  ClockCircleOutline,
  UserOutline,
} from 'antd-mobile-icons'

const tabs = [
  { key: '/', title: '首页', icon: <AppOutline /> },
  { key: '/diary', title: '日记', icon: <UnorderedListOutline /> },
  { key: '/map', title: '足迹', icon: <LocationOutline /> },
  { key: '/countdown', title: '倒数日', icon: <ClockCircleOutline /> },
  { key: '/profile', title: '我的', icon: <UserOutline /> },
]

export default function Layout() {
  const location = useLocation()
  const navigate = useNavigate()

  return (
    <div className="flex flex-col h-screen">
      <div className="flex-1 overflow-auto">
        <Outlet />
      </div>
      <div className="border-t border-gray-200 bg-white">
        <TabBar activeKey={location.pathname} onChange={(key) => navigate(key)}>
          {tabs.map((item) => (
            <TabBar.Item key={item.key} icon={item.icon} title={item.title} />
          ))}
        </TabBar>
      </div>
    </div>
  )
}
