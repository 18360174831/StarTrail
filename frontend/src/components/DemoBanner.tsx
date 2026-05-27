import { useNavigate } from 'react-router-dom'
import { Toast } from 'antd-mobile'

export default function DemoBanner() {
  const navigate = useNavigate()

  const handleExit = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('demo')
    navigate('/login')
  }

  return (
    <div className="bg-yellow-400 text-yellow-900 px-4 py-2 flex items-center justify-between text-sm font-medium sticky top-0 z-50">
      <span>🎭 Demo 模式 — 功能受限</span>
      <button
        className="bg-yellow-900 text-yellow-100 px-3 py-1 rounded-full text-xs font-medium"
        onClick={handleExit}
      >
        退出 Demo
      </button>
    </div>
  )
}

export function useDemoCheck() {
  const isDemo = localStorage.getItem('demo') === 'true'
  return {
    isDemo,
    checkAction: (action: string) => {
      if (isDemo) {
        Toast.show({ content: `请登录后使用${action}`, position: 'center' })
        return false
      }
      return true
    }
  }
}
