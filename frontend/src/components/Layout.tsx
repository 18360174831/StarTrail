import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { TabBar, NavBar } from 'antd-mobile'
import {
  AppOutline,
  UnorderedListOutline,
  LocationOutline,
  ClockCircleOutline,
  UserOutline,
} from 'antd-mobile-icons'
import { useDemoCheck } from './DemoBanner'

const tabs = [
  { key: '/', title: '首页', icon: <AppOutline /> },
  { key: '/diary', title: '日记', icon: <UnorderedListOutline /> },
  { key: '/map', title: '足迹', icon: <LocationOutline /> },
  { key: '/countdown', title: '倒数日', icon: <ClockCircleOutline /> },
]

export default function Layout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { isDemo } = useDemoCheck()

  const right = (
    <div className="flex items-center gap-2">
      {!isDemo && (
        <span className="text-xs text-gray-400 cursor-pointer" onClick={() => navigate('/admin')}>
          管理
        </span>
      )}
      <div
        className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 cursor-pointer"
        onClick={() => navigate('/profile')}
      >
        <UserOutline />
      </div>
    </div>
  )

  return (
    <div className="flex flex-col h-screen">
      <NavBar right={right} className="border-b border-gray-100 bg-white">
        StarTrail
      </NavBar>
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
