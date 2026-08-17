import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import AdminDashboard from './pages/AdminDashboard'
import TeacherDashboard from './pages/TeacherDashboard'
import ParentDashboard from './pages/ParentDashboard'
import ClassManagement from './pages/ClassManagement'
import SubjectManagement from './pages/SubjectManagement'
import StudentManagement from './pages/StudentManagement'
import TeacherManagement from './pages/TeacherManagement'
import ParentManagement from './pages/ParentManagement'
import { useAuth } from './context/AuthContext'

const ProtectedRoute = ({ children, allowedRoles }) => {
    const { user } = useAuth();
    
    if (!user) {
        return <Navigate to="/login" replace />;
    }
    
    if (allowedRoles && !allowedRoles.includes(user.role)) {
        return <Navigate to="/login" replace />; // or an unauthorized page
    }
    
    return children;
};

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      
      <Route path="/admin/dashboard" element={
        <ProtectedRoute allowedRoles={['ADMIN']}>
          <AdminDashboard />
        </ProtectedRoute>
      } />
      
      <Route path="/admin/classes" element={
        <ProtectedRoute allowedRoles={['ADMIN']}>
          <ClassManagement />
        </ProtectedRoute>
      } />

      <Route path="/admin/subjects" element={
        <ProtectedRoute allowedRoles={['ADMIN']}>
          <SubjectManagement />
        </ProtectedRoute>
      } />
      
      <Route path="/admin/students" element={
        <ProtectedRoute allowedRoles={['ADMIN']}>
          <StudentManagement />
        </ProtectedRoute>
      } />

      <Route path="/admin/teachers" element={
        <ProtectedRoute allowedRoles={['ADMIN']}>
          <TeacherManagement />
        </ProtectedRoute>
      } />

      <Route path="/admin/parents" element={
        <ProtectedRoute allowedRoles={['ADMIN']}>
          <ParentManagement />
        </ProtectedRoute>
      } />
      
      <Route path="/teacher/dashboard" element={
        <ProtectedRoute allowedRoles={['CLASS_TEACHER']}>
          <TeacherDashboard />
        </ProtectedRoute>
      } />
      
      <Route path="/parent/dashboard" element={
        <ProtectedRoute allowedRoles={['PARENT']}>
          <ParentDashboard />
        </ProtectedRoute>
      } />
    </Routes>
  )
}

export default App
