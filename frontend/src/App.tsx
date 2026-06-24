import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { AddPatient } from './pages/AddPatient';
import { WaitingRoomDisplay } from './pages/WaitingRoomDisplay';
import { PatientTracking } from './pages/PatientTracking';
import { AuditLogs } from './pages/AuditLogs';
import { QueueManagement } from './pages/QueueManagement';
import { ConsultationLogs } from './pages/ConsultationLogs';
import { Settings } from './pages/Settings';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/display" element={<WaitingRoomDisplay />} />
          <Route path="/track/:tokenId" element={<PatientTracking />} />

          {/* Protected Routes (Receptionist) */}
          <Route element={<DashboardLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/add-patient" element={<AddPatient />} />
            <Route path="/queue" element={<QueueManagement />} />
            <Route path="/consultations" element={<ConsultationLogs />} />
            <Route path="/audit-logs" element={<AuditLogs />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
