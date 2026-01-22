import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout/Layout'
import UserDashboard from './pages/UserDashboard'
import AdminDashboard from './pages/AdminDashboard'
import WorkflowDesigner from './components/WorkflowDesigner/Designer'
import FormBuilder from './components/FormBuilder/FormDesigner'
import WorkflowList from './components/Monitoring/WorkflowList'
import InstanceMonitor from './components/Monitoring/InstanceMonitor'
import Analytics from './components/Monitoring/Analytics'
import TaskList from './components/TaskManager/TaskList'
import TaskDetail from './components/TaskManager/TaskDetail'

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<UserDashboard />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/analytics" element={<Analytics />} />
        <Route path="/workflows" element={<WorkflowList />} />
        <Route path="/workflows/new" element={<WorkflowDesigner />} />
        <Route path="/workflows/:id/edit" element={<WorkflowDesigner />} />
        <Route path="/workflows/:id/instances" element={<InstanceMonitor />} />
        <Route path="/forms/new" element={<FormBuilder />} />
        <Route path="/forms/:id/edit" element={<FormBuilder />} />
        <Route path="/tasks" element={<TaskList />} />
        <Route path="/tasks/:id" element={<TaskDetail />} />
      </Routes>
    </Layout>
  )
}

export default App
