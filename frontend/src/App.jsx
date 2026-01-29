import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { queryClient } from './lib/queryClient'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout/Layout'

// Auth pages
import Login from './pages/Login'
import Register from './pages/Register'

// User pages
import UserDashboard from './pages/UserDashboard'
import UserProfile from './pages/UserProfile'
import TaskList from './components/TaskManager/TaskList'
import TaskDetail from './components/TaskManager/TaskDetail'

// Admin pages
import AdminDashboard from './pages/AdminDashboard'
import Analytics from './components/Monitoring/Analytics'
import UserManagement from './pages/Admin/UserManagement'
import UserDetails from './pages/Admin/UserDetails'
import CreateUser from './pages/Admin/CreateUser'
import PendingUsers from './pages/Admin/PendingUsers'

// Workflow pages
import WorkflowDesigner from './components/WorkflowDesigner/Designer'
import FormBuilder from './components/FormBuilder/FormDesigner'
import WorkflowList from './components/Monitoring/WorkflowList'
import InstanceMonitor from './components/Monitoring/InstanceMonitor'

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

        {/* Protected routes */}
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <Layout>
                <Routes>
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  <Route path="/dashboard" element={<UserDashboard />} />
                  <Route path="/profile" element={<UserProfile />} />
                  
                  {/* Tasks */}
                  <Route path="/tasks" element={<TaskList />} />
                  <Route path="/tasks/:id" element={<TaskDetail />} />
                  
                  {/* Workflows */}
                  <Route path="/workflows" element={<WorkflowList />} />
                  <Route path="/workflows/new" element={<WorkflowDesigner />} />
                  <Route path="/workflows/:id/edit" element={<WorkflowDesigner />} />
                  <Route path="/workflows/:id/instances" element={<InstanceMonitor />} />
                  
                  {/* Forms */}
                  <Route path="/forms/new" element={<FormBuilder />} />
                  <Route path="/forms/:id/edit" element={<FormBuilder />} />
                  
                  {/* Admin routes */}
                  <Route
                    path="/admin"
                    element={
                      <ProtectedRoute requiredRole="admin">
                        <AdminDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/analytics"
                    element={
                      <ProtectedRoute requiredRole="admin">
                        <Analytics />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/users"
                    element={
                      <ProtectedRoute requiredRole="admin">
                        <UserManagement />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/users/:id"
                    element={
                      <ProtectedRoute requiredRole="admin">
                        <UserDetails />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/users/create"
                    element={
                      <ProtectedRoute requiredRole="admin">
                        <CreateUser />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/users/pending"
                    element={
                      <ProtectedRoute requiredRole="admin">
                        <PendingUsers />
                      </ProtectedRoute>
                    }
                  />
                </Routes>
              </Layout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </AuthProvider>
    <ReactQueryDevtools initialIsOpen={false} />
  </QueryClientProvider>
  )
}

export default App
