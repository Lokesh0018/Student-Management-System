import React, { Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import { Layout } from './components/layout/Layout'

const Login = React.lazy(() => import('./pages/Login'));
const AdminDashboard = React.lazy(() => import('./pages/AdminDashboard'));
const TeacherDashboard = React.lazy(() => import('./pages/TeacherDashboard'));
const ParentDashboard = React.lazy(() => import('./pages/ParentDashboard'));
const ClassDetails = React.lazy(() => import('./pages/ClassDetails'));
const AddClass = React.lazy(() => import('./pages/AddClass'));
const EditClass = React.lazy(() => import('./pages/EditClass'));
const ClassesList = React.lazy(() => import('./pages/ClassesList'));
const StudentList = React.lazy(() => import('./pages/StudentList'));
const StudentManagement = React.lazy(() => import('./pages/StudentManagement'));
const AddStudent = React.lazy(() => import('./pages/AddStudent'));
const EditStudent = React.lazy(() => import('./pages/EditStudent'));
const TeacherClassView = React.lazy(() => import('./pages/TeacherClassView'));
const AddTeacher = React.lazy(() => import('./pages/AddTeacher'));
const EditTeacher = React.lazy(() => import('./pages/EditTeacher'));
const TeachersList = React.lazy(() => import('./pages/TeachersList'));
const TeacherDetails = React.lazy(() => import('./pages/TeacherDetails'));
const ExaminationsList = React.lazy(() => import('./pages/ExaminationsList'));
const AddExam = React.lazy(() => import('./pages/AddExam'));
const EditExam = React.lazy(() => import('./pages/EditExam'));
const SubjectsList = React.lazy(() => import('./pages/SubjectsList'));
const AddSubject = React.lazy(() => import('./pages/AddSubject'));
const EditSubject = React.lazy(() => import('./pages/EditSubject'));
const MarkManagement = React.lazy(() => import('./pages/MarkManagement'));
const AttendanceManagement = React.lazy(() => import('./pages/AttendanceManagement'));
const RemarkManagement = React.lazy(() => import('./pages/RemarkManagement'));
const PerformanceAnalytics = React.lazy(() => import('./pages/PerformanceAnalytics'));
const ReportsList = React.lazy(() => import('./pages/ReportsList'));

// Parent Pages
const ParentChildren = React.lazy(() => import('./pages/ParentChildren'));
const ParentScorecards = React.lazy(() => import('./pages/ParentScorecards'));
const ParentAttendance = React.lazy(() => import('./pages/ParentAttendance'));
const ParentPerformance = React.lazy(() => import('./pages/ParentPerformance'));
const ParentRemarks = React.lazy(() => import('./pages/ParentRemarks'));
const PlaceholderPage = React.lazy(() => import('./pages/PlaceholderPage'));
const Settings = React.lazy(() => import('./pages/Settings'));
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
    <Suspense fallback={null}>
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

        <Route path="/admin/reports" element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <ReportsList />
          </ProtectedRoute>
        } />
        <Route path="/teacher/dashboard" element={
          <ProtectedRoute allowedRoles={['CLASS_TEACHER']}>
            <TeacherDashboard />
          </ProtectedRoute>
        } />

        <Route path="/teacher/students" element={
          <ProtectedRoute allowedRoles={['CLASS_TEACHER']}>
            <TeacherClassView />
          </ProtectedRoute>
        } />

        <Route path="/teacher/students/add" element={
          <ProtectedRoute allowedRoles={['CLASS_TEACHER']}>
            <AddStudent />
          </ProtectedRoute>
        } />

        <Route path="/teacher/students/:id/edit" element={
          <ProtectedRoute allowedRoles={['CLASS_TEACHER']}>
            <EditStudent />
          </ProtectedRoute>
        } />

        <Route path="/teacher/students/:id" element={
          <ProtectedRoute allowedRoles={['CLASS_TEACHER']}>
            <StudentManagement />
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

        <Route path="/parent/children" element={
          <ProtectedRoute allowedRoles={['PARENT']}>
            <ParentChildren />
          </ProtectedRoute>
        } />

        <Route path="/parent/scorecards" element={
          <ProtectedRoute allowedRoles={['PARENT']}>
            <ParentScorecards />
          </ProtectedRoute>
        } />

        <Route path="/parent/performance" element={
          <ProtectedRoute allowedRoles={['PARENT']}>
            <ParentPerformance />
          </ProtectedRoute>
        } />

        <Route path="/parent/attendance" element={
          <ProtectedRoute allowedRoles={['PARENT']}>
            <ParentAttendance />
          </ProtectedRoute>
        } />

        <Route path="/parent/remarks" element={
          <ProtectedRoute allowedRoles={['PARENT']}>
            <ParentRemarks />
          </ProtectedRoute>
        } />

        <Route path="/admin/settings" element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <Settings />
          </ProtectedRoute>
        } />
        
        <Route path="/teacher/settings" element={
          <ProtectedRoute allowedRoles={['CLASS_TEACHER']}>
            <Settings />
          </ProtectedRoute>
        } />
        
        <Route path="/parent/settings" element={
          <ProtectedRoute allowedRoles={['PARENT']}>
            <Settings />
          </ProtectedRoute>
        } />
      </Routes>
    </Suspense>
  )
}

export default App
