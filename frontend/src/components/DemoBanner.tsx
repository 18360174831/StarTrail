import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Toast } from 'antd-mobile'

export default function DemoBanner() {
  const navigate = useNavigate()
  const [showGuide, setShowGuide] = useState(false)

  useEffect(() => {
    const guided = sessionStorage.getItem('demo_guided')
    if (!guided) {
      setShowGuide(true)
      sessionStorage.setItem('demo_guided', 'true')
    }
  }, [])

  const handleLogin = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('demo')
    sessionStorage.removeItem('demo_guided')
    navigate('/login')
  }

  return (
    <>
      <div className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-4 py-2 flex items-center justify-between text-sm sticky top-0 z-50">
        <span>🎭 游客模式 — 浏览功能界面</span>
        <div className="flex items-center gap-2">
          <button
            className="bg-white/20 text-white px-3 py-1 rounded-full text-xs font-medium hover:bg-white/30"
            onClick={() => setShowGuide(true)}
          >
            功能引导
          </button>
          <button
            className="bg-white text-purple-600 px-3 py-1 rounded-full text-xs font-medium hover:bg-gray-100"
            onClick={handleLogin}
          >
            登录/注册
          </button>
        </div>
      </div>

      {showGuide && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center px-6" onClick={() => setShowGuide(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold text-center text-gray-800 mb-2">🎉 欢迎体验 StarTrail</h2>
            <p className="text-gray-500 text-sm text-center mb-5">追星日记平台 — 记录你的追星旅程</p>

            <div className="space-y-3 mb-4">
              <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-xl">
                <span className="text-lg">📝</span>
                <div>
                  <div className="font-medium text-sm text-gray-800">日记广场</div>
                  <div className="text-xs text-gray-500">浏览追星日记，查看多图内容和标签分类</div>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-xl">
                <span className="text-lg">📍</span>
                <div>
                  <div className="font-medium text-sm text-gray-800">追星足迹</div>
                  <div className="text-xs text-gray-500">查看地图上的场馆和打卡地点</div>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-orange-50 rounded-xl">
                <span className="text-lg">⏰</span>
                <div>
                  <div className="font-medium text-sm text-gray-800">倒数日</div>
                  <div className="text-xs text-gray-500">查看演唱会、生日等重要日期倒计时</div>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-green-50 rounded-xl">
                <span className="text-lg">👤</span>
                <div>
                  <div className="font-medium text-sm text-gray-800">个人中心</div>
                  <div className="text-xs text-gray-500">查看个人主页和功能入口</div>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 mb-5">
              <div className="text-xs text-yellow-800">
                💡 <strong>提示：</strong>游客模式下可以浏览所有页面，发布日记、点赞、评论等操作需要登录后使用。
              </div>
            </div>

            <div className="flex gap-2">
              <button
                className="flex-1 border border-gray-200 text-gray-600 py-3 rounded-xl font-medium text-sm hover:bg-gray-50"
                onClick={() => setShowGuide(false)}
              >
                先逛逛
              </button>
              <button
                className="flex-1 bg-gradient-to-r from-purple-500 to-indigo-500 text-white py-3 rounded-xl font-medium text-sm hover:opacity-90"
                onClick={handleLogin}
              >
                登录/注册
              </button>
            </div>
          </div>
        </div>
      )}
    </>
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
