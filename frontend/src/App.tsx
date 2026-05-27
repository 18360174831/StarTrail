import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import LoginPage from './pages/login'
import HomePage from './pages/home'
import DiaryPage from './pages/diary'
import MapPage from './pages/map'
import ProfilePage from './pages/profile'
import CountdownPage from './pages/countdown'

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('token')
  return token ? <>{children}</> : <Navigate to="/login" />
}

export default function App() {
  return (
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
    </Routes>
  )
}
