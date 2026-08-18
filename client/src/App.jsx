import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import AdminDashboard from './pages/AdminDashboard'
import TeacherDashboard from './pages/TeacherDashboard'
import ParentDashboard from './pages/ParentDashboard'
import ClassDetails from './pages/ClassDetails'
import AddClass from './pages/AddClass'
import EditClass from './pages/EditClass'
import ClassesList from './pages/ClassesList'
import StudentList from './pages/StudentList'
import StudentManagement from './pages/StudentManagement'
import AddStudent from './pages/AddStudent'
import EditStudent from './pages/EditStudent'
import AddTeacher from './pages/AddTeacher'
import EditTeacher from './pages/EditTeacher'
import TeachersList from './pages/TeachersList'
import TeacherDetails from './pages/TeacherDetails'

import ExaminationsList from './pages/ExaminationsList'
import AddExam from './pages/AddExam'
import EditExam from './pages/EditExam'
import SubjectsList from './pages/SubjectsList'
import AddSubject from './pages/AddSubject'
import EditSubject from './pages/EditSubject'
import MarkManagement from './pages/MarkManagement'
import AttendanceManagement from './pages/AttendanceManagement'
import RemarkManagement from './pages/RemarkManagement'
import PerformanceAnalytics from './pages/PerformanceAnalytics'
import { useAuth } from './context/AuthContext'
import { Layout } from './components/layout/Layout'

const ProtectedRoute = ({ children, allowedRoles }) => {
    const { user } = useAuth();
    
    if (!user) {
        return <Navigate to="/login" replace />;
    }
    
    if (allowedRoles && !allowedRoles.includes(user.role)) {
        return <Navigate to="/login" replace />; // or an unauthorized page
    }
    
    return <Layout>{children}</Layout>;
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
          <ClassesList />
        </ProtectedRoute>
      } />

      <Route path="/admin/classes/add" element={
        <ProtectedRoute allowedRoles={['ADMIN']}>
          <AddClass />
        </ProtectedRoute>
      } />

      <Route path="/admin/classes/:id/edit" element={
        <ProtectedRoute allowedRoles={['ADMIN']}>
          <EditClass />
        </ProtectedRoute>
      } />

      <Route path="/admin/classes/:id" element={
        <ProtectedRoute allowedRoles={['ADMIN']}>
          <ClassDetails />
        </ProtectedRoute>
      } />

      
      <Route path="/admin/students" element={
        <ProtectedRoute allowedRoles={['ADMIN']}>
          <StudentList />
        </ProtectedRoute>
      } />

      <Route path="/admin/students/add" element={
        <ProtectedRoute allowedRoles={['ADMIN']}>
          <AddStudent />
        </ProtectedRoute>
      } />

      <Route path="/admin/students/:id/edit" element={
        <ProtectedRoute allowedRoles={['ADMIN']}>
          <EditStudent />
        </ProtectedRoute>
      } />

      <Route path="/admin/students/:id" element={
        <ProtectedRoute allowedRoles={['ADMIN']}>
          <StudentManagement />
        </ProtectedRoute>
      } />

      <Route path="/admin/teachers" element={
        <ProtectedRoute allowedRoles={['ADMIN']}>
          <TeachersList />
        </ProtectedRoute>
      } />

      <Route path="/admin/teachers/add" element={
        <ProtectedRoute allowedRoles={['ADMIN']}>
          <AddTeacher />
        </ProtectedRoute>
      } />

      <Route path="/admin/teachers/:id/edit" element={
        <ProtectedRoute allowedRoles={['ADMIN']}>
          <EditTeacher />
        </ProtectedRoute>
      } />

      <Route path="/admin/teachers/:id" element={
        <ProtectedRoute allowedRoles={['ADMIN']}>
          <TeacherDetails />
        </ProtectedRoute>
      } />


      <Route path="/admin/exams" element={
        <ProtectedRoute allowedRoles={['ADMIN']}>
          <ExaminationsList />
        </ProtectedRoute>
      } />

      <Route path="/admin/exams/add" element={
        <ProtectedRoute allowedRoles={['ADMIN']}>
          <AddExam />
        </ProtectedRoute>
      } />

      <Route path="/admin/exams/:id/edit" element={
        <ProtectedRoute allowedRoles={['ADMIN']}>
          <EditExam />
        </ProtectedRoute>
      } />

      <Route path="/admin/subjects" element={
        <ProtectedRoute allowedRoles={['ADMIN']}>
          <SubjectsList />
        </ProtectedRoute>
      } />

      <Route path="/admin/subjects/add" element={
        <ProtectedRoute allowedRoles={['ADMIN']}>
          <AddSubject />
        </ProtectedRoute>
      } />

      <Route path="/admin/subjects/:id/edit" element={
        <ProtectedRoute allowedRoles={['ADMIN']}>
          <EditSubject />
        </ProtectedRoute>
      } />

      <Route path="/admin/marks" element={
        <ProtectedRoute allowedRoles={['ADMIN', 'CLASS_TEACHER']}>
          <MarkManagement />
        </ProtectedRoute>
      } />

      <Route path="/admin/attendance" element={
        <ProtectedRoute allowedRoles={['ADMIN', 'CLASS_TEACHER']}>
          <AttendanceManagement />
        </ProtectedRoute>
      } />

      <Route path="/admin/remarks" element={
        <ProtectedRoute allowedRoles={['ADMIN', 'CLASS_TEACHER']}>
          <RemarkManagement />
        </ProtectedRoute>
      } />

      <Route path="/admin/performance" element={
        <ProtectedRoute allowedRoles={['ADMIN', 'CLASS_TEACHER']}>
          <PerformanceAnalytics />
        </ProtectedRoute>
      } />
      
      <Route path="/teacher/dashboard" element={
        <ProtectedRoute allowedRoles={['CLASS_TEACHER']}>
          <TeacherDashboard />
        </ProtectedRoute>
      } />

      <Route path="/teacher/marks" element={
        <ProtectedRoute allowedRoles={['CLASS_TEACHER']}>
          <MarkManagement />
        </ProtectedRoute>
      } />

      <Route path="/teacher/attendance" element={
        <ProtectedRoute allowedRoles={['CLASS_TEACHER']}>
          <AttendanceManagement />
        </ProtectedRoute>
      } />

      <Route path="/teacher/remarks" element={
        <ProtectedRoute allowedRoles={['CLASS_TEACHER']}>
          <RemarkManagement />
        </ProtectedRoute>
      } />

      <Route path="/teacher/performance" element={
        <ProtectedRoute allowedRoles={['CLASS_TEACHER']}>
          <PerformanceAnalytics />
        </ProtectedRoute>
      } />
      
      <Route path="/parent/dashboard" element={
        <ProtectedRoute allowedRoles={['PARENT']}>
          <ParentDashboard />
        </ProtectedRoute>
      } />

      <Route path="/parent/remarks" element={
        <ProtectedRoute allowedRoles={['PARENT']}>
          <RemarkManagement />
        </ProtectedRoute>
      } />
    </Routes>
  )
}

export default App
