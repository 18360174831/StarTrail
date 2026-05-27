import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, List, Avatar, Toast, Dialog } from 'antd-mobile'
import { RightOutline } from 'antd-mobile-icons'
import { getProfile } from '../../api/user'

interface UserProfile {
  id: string
  username: string
  nickname: string
  avatar_url?: string
  bio?: string
  created_at: string
}

export default function ProfilePage() {
  const navigate = useNavigate()
  const [user, setUser] = useState<UserProfile | null>(null)

  useEffect(() => { loadProfile() }, [])

  const loadProfile = async () => {
    try {
      const res: any = await getProfile()
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

  return (
    <div className="p-4 pb-20">
      <h1 className="text-xl font-bold text-gray-800 mb-4">我的</h1>

      <Card className="!rounded-xl mb-4" style={{ background: 'linear-gradient(135deg, #6c5ce7, #a29bfe)', color: 'white' }}>
        <div className="flex items-center gap-4">
          <Avatar src={user?.avatar_url || ''} style={{ '--size': '56px', '--border-radius': '50%' }} />
          <div>
            <div className="font-semibold text-lg">{user?.nickname || user?.username || '用户'}</div>
            {user?.bio && <div className="text-sm text-white/70 mt-1">{user.bio}</div>}
            <div className="text-xs text-white/50 mt-1">
              {user?.created_at ? `加入于 ${new Date(user.created_at).toLocaleDateString()}` : ''}
            </div>
          </div>
        </div>
      </Card>

      <Card className="!rounded-xl">
        <List>
          <List.Item onClick={() => navigate('/diary')} clickable prefix={<RightOutline className="text-gray-400" />}>
            <span className="text-gray-700">我的日记</span>
          </List.Item>
          <List.Item onClick={() => navigate('/map')} clickable prefix={<RightOutline className="text-gray-400" />}>
            <span className="text-gray-700">我的足迹</span>
          </List.Item>
          <List.Item onClick={() => navigate('/countdown')} clickable prefix={<RightOutline className="text-gray-400" />}>
            <span className="text-gray-700">倒数日</span>
          </List.Item>
          <List.Item clickable onClick={handleLogout}>
            <span className="text-red-500">退出登录</span>
          </List.Item>
        </List>
      </Card>
    </div>
  )
}
