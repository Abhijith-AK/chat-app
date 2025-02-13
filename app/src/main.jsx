import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import {Provider} from "react-redux"
import { userStore } from './store/userStore.js'

createRoot(document.getElementById('root')).render(
  <StrictMode>
   <BrowserRouter>
     <Provider store={userStore}> <App /></Provider>
    </BrowserRouter>
  
  </StrictMode>,
)
