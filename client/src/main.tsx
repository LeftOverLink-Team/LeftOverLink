import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './app/app'
import { AuthProvider } from './app/context/AuthContext'
import { SettingsProvider } from './app/context/SettingsContext'
import './styles/index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <AuthProvider>
            <SettingsProvider>
                <App />
            </SettingsProvider>
        </AuthProvider>
    </React.StrictMode>,
)
