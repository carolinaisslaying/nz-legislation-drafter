import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { LegislationProvider } from './context/LegislationContext'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <React.StrictMode>
        <LegislationProvider>
            <App />
        </LegislationProvider>
    </React.StrictMode>,
)
