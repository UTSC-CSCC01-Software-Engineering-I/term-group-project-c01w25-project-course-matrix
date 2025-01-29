import './App.css'
import { Navigate, Route, Routes } from 'react-router-dom'
import LoginPage from './pages/Login/LoginPage'

function App() {

  return (
    <div>
      <Routes>
        <Route path="/" element={<Navigate to="/login"/>}/>
        <Route path="/login" element={<LoginPage/>} />
      </Routes>
    </div>
  )
}

export default App
