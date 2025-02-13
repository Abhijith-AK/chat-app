import { useEffect, useState } from 'react'
import './App.css'
import io from "socket.io-client"
import { Route, Routes } from 'react-router-dom'
import Auth from './pages/Auth'
import Home from './pages/Home'

export const socket = io("http://localhost:5000")
window.global = window;  
function App() {
  window.global = window;
  return (
    <div className='bg-gray-300 h-screen w-full flex'>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/register' element={<Auth type={'register'} />} />
        <Route path='/login' element={<Auth type={'login'} />} />
      </Routes>
    </div>
  )
}

export default App
