import './App.css'
import { Navigate, Route, Routes } from 'react-router-dom'
import LoginPage from './pages/Login/LoginPage'
import Dashboard from './pages/Dashboard/Dashboard'

function App() {

  return (
    <div className="w-full">
      <Routes>
        <Route path="/" element={<Navigate to="/login"/>}/>
        <Route path="/login" element={<LoginPage/>} />
        <Route path="/dashboard/*" element={<Dashboard/>}/>
      </Routes>
    </div>
  )
}

export default App
