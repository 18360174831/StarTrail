import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, List, Avatar, Toast, Dialog } from 'antd-mobile'
import { RightOutline } from 'antd-mobile-icons'
import { getProfile } from '../../api/user'
import './index.css'

interface UserProfile {
  id: string
  username: string
  avatar?: string
  createdAt: string
}

export default function ProfilePage() {
  const navigate = useNavigate()
  const [user, setUser] = useState<UserProfile | null>(null)

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      const res = await getProfile() as any
      setUser(res?.data || null)
    } catch {
      Toast.show({ content: '加载失败', position: 'center' })
    }
  }

  const handleLogout = async () => {
    const confirmed = await Dialog.confirm({ content: '确定退出登录吗？' })
    if (confirmed) {
      localStorage.removeItem('token')
      navigate('/login')
    }
  }

  const menuItems = [
    { title: '我的日记', path: '/diary' },
    { title: '我的足迹', path: '/map' },
    { title: '倒数日', path: '/countdown' },
  ]

  return (
    <div className="p-4 pb-20">
      <h1 className="text-xl font-bold text-gray-800 mb-4">我的</h1>

      <Card className="profile-card !rounded-xl mb-4">
        <div className="flex items-center gap-4">
          <Avatar
            src={user?.avatar || ''}
            style={{ '--size': '56px', '--border-radius': '50%' }}
          />
          <div>
            <div className="font-semibold text-gray-800 text-lg">{user?.username || '用户'}</div>
            <div className="text-xs text-gray-400 mt-1">
              {user?.createdAt ? `加入于 ${new Date(user.createdAt).toLocaleDateString()}` : ''}
            </div>
          </div>
        </div>
      </Card>

      <Card className="!rounded-xl">
        <List>
          {menuItems.map((item) => (
            <List.Item
              key={item.path}
              onClick={() => navigate(item.path)}
              clickable
              prefix={<RightOutline className="text-gray-400" />}
            >
              <span className="text-gray-700">{item.title}</span>
            </List.Item>
          ))}
          <List.Item clickable onClick={handleLogout}>
            <span className="text-red-500">退出登录</span>
          </List.Item>
        </List>
      </Card>
    </div>
  )
}
