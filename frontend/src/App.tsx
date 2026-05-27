import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import DemoBanner from './components/DemoBanner'
import LoginPage from './pages/login'
import HomePage from './pages/home'
import DiaryPage from './pages/diary'
import MapPage from './pages/map'
import ProfilePage from './pages/profile'
import CountdownPage from './pages/countdown'
import AdminPage from './pages/admin'

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('token')
  return token ? <>{children}</> : <Navigate to="/login" />
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('token')
  const isDemo = localStorage.getItem('demo') === 'true'
  if (!token || isDemo) return <Navigate to="/" />
  return <>{children}</>
}

export default function App() {
  const isDemo = localStorage.getItem('demo') === 'true'

  return (
    <>
      {isDemo && <DemoBanner />}
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Layout />
            </PrivateRoute>
          }
        >
          <Route index element={<HomePage />} />
          <Route path="diary" element={<DiaryPage />} />
          <Route path="map" element={<MapPage />} />
          <Route path="countdown" element={<CountdownPage />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>
        <Route path="/admin" element={<AdminRoute><AdminPage /></AdminRoute>} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  )
}
