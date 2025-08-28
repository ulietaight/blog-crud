import { Route, Routes, Navigate } from 'react-router-dom'
import { Login } from './pages/Login'
import { Rounds } from './pages/Rounds'
import { Round } from './pages/Round'
import { useAuth } from './store'

export default function App() {
  const user = useAuth((s) => s.user)
  return (
    <Routes>
      <Route path="/" element={user ? <Navigate to="/rounds" /> : <Login />} />
      <Route path="/rounds" element={user ? <Rounds /> : <Navigate to="/" />} />
      <Route path="/rounds/:id" element={user ? <Round /> : <Navigate to="/" />} />
    </Routes>
  )
}
