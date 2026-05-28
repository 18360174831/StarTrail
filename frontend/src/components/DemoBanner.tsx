import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'


export default function DemoBanner() {
  const navigate = useNavigate()
  const [showGuide, setShowGuide] = useState(false)

  useEffect(() => {
    // Show welcome guide on first demo visit
    const guided = sessionStorage.getItem('demo_guided')
    if (!guided) {
      setShowGuide(true)
      sessionStorage.setItem('demo_guided', 'true')
    }
  }, [])

  const handleExit = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('demo')
    sessionStorage.removeItem('demo_guided')
    navigate('/login')
  }

  return (
    <>
      <div className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-4 py-2 flex items-center justify-between text-sm sticky top-0 z-50">
        <span>🎭 Demo 模式 — 所有功能均可体验</span>
        <div className="flex items-center gap-2">
          <button
            className="bg-white/20 text-white px-3 py-1 rounded-full text-xs font-medium hover:bg-white/30"
            onClick={() => setShowGuide(true)}
          >
            功能引导
          </button>
          <button
            className="bg-white text-purple-600 px-3 py-1 rounded-full text-xs font-medium hover:bg-gray-100"
            onClick={handleExit}
          >
            退出
          </button>
        </div>
      </div>

      {showGuide && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center px-6" onClick={() => setShowGuide(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold text-center text-gray-800 mb-2">🎉 欢迎体验 StarTrail</h2>
            <p className="text-gray-500 text-sm text-center mb-5">追星日记平台 — 记录你的追星旅程</p>

            <div className="space-y-3 mb-6">
              <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-xl">
                <span className="text-lg">📝</span>
                <div>
                  <div className="font-medium text-sm text-gray-800">日记广场</div>
                  <div className="text-xs text-gray-500">写下追星日记，支持多图上传、标签分类</div>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-xl">
                <span className="text-lg">📍</span>
                <div>
                  <div className="font-medium text-sm text-gray-800">追星足迹</div>
                  <div className="text-xs text-gray-500">地图上标记你去过的场馆和打卡地点</div>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-orange-50 rounded-xl">
                <span className="text-lg">⏰</span>
                <div>
                  <div className="font-medium text-sm text-gray-800">倒数日</div>
                  <div className="text-xs text-gray-500">演唱会、生日等重要日期倒计时</div>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-green-50 rounded-xl">
                <span className="text-lg">👤</span>
                <div>
                  <div className="font-medium text-sm text-gray-800">个人中心</div>
                  <div className="text-xs text-gray-500">管理你的个人资料和追星偏好</div>
                </div>
              </div>
            </div>

            <button
              className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 text-white py-3 rounded-xl font-medium text-sm hover:opacity-90"
              onClick={() => setShowGuide(false)}
            >
              开始探索 →
            </button>
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
    checkAction: (_action: string) => {
      // Demo mode: all actions allowed (using real account)
      return true
    }
  }
}
