import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext'
import { BreadcrumbProvider } from './context/BreadcrumbContext'
import ErrorBoundary from './components/ErrorBoundary'
import { Toaster } from 'react-hot-toast'
import './index.css'
import './pages/css/AddStudent.css'
import './pages/css/AdminDashboard.css'
import './pages/css/Login.css'
import './pages/css/Management.css'
import './pages/css/ReportsList.css'
import './pages/css/StudentList.css'
import './pages/css/StudentProfile.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ErrorBoundary>
        <AuthProvider>
          <BreadcrumbProvider>
            <Toaster 
              position="top-right"
              toastOptions={{
                style: {
                  background: 'var(--surface)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border)',
                  fontFamily: 'var(--font-sans)',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }
              }}
            />
            <App />
          </BreadcrumbProvider>
        </AuthProvider>
      </ErrorBoundary>
    </BrowserRouter>
  </React.StrictMode>,
)
