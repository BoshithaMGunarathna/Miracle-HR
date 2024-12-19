import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import LeaveForm from "./pages/LeaveForm";
import Profile from "./pages/Profile";
import History from "./pages/History";
import Dashboard from "./pages/Dashboard";
import UpdateLeave from "./pages/UpdateLeave";
import MarkAttendance from "./pages/MarkAttendance";
import './index.css';
import EmployeeAttendance from './pages/Admin/EmployeeAttendance';
import HRAttendance from './pages/HR/Attendance';
import HRLeave from './pages/HR/Leave';
import Attendance from './pages/Attendance';

import LeaveHistory from './pages/Admin/LeaveHistory';
import ManageEmployee from './pages/Admin/ManageEmployee';
import LeaveCancelRequests from './pages/Admin/LeaveUpdateResquests';
import Requests from './pages/Admin/Requests';
import LeavePlan from './pages/Admin/LeavePlan';
import AttendanceUpdateRequests from './pages/Admin/AttendanceUpdateRequests';
import { AuthProvider } from './pages/AuthContext';
import { ProtectedRoute } from './pages/ProtectedRoute';


function App() {
  return (
    // <div className="App">
    //    <NavBar />
    //   <Menue />
    // </div>

    // <Router>
    //   <Routes>
    //    
    //   
    //   
    //   
    //     {/* <Route path="/admin" element={<Admin />} /> */}

    //    
    //     
    //     <Route path="/hr/attendance" element={<HRAttendance />} />
    //     <Route path="/hr/leave" element={<HRLeave />} />






    //   </Routes>
    // </Router>


    <Router>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Employee Routes */}
          <Route
            path="/leave"
            element={
              <ProtectedRoute roles={['employee']}>
                <LeaveForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile/:emp_id"
            element={
              <ProtectedRoute roles={['employee']}>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/history"
            element={
              <ProtectedRoute roles={['employee']}>
                <History />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute roles={['employee']}>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/update-leave"
            element={
              <ProtectedRoute roles={['employee']}>
                <UpdateLeave />
              </ProtectedRoute>
            }
          />
          <Route
            path="/attendance"
            element={
              <ProtectedRoute roles={['employee']}>
                <Attendance />
              </ProtectedRoute>
            }
          />
          <Route
            path="/mark-attendance"
            element={
              <ProtectedRoute roles={['employee']}>
                <MarkAttendance />
              </ProtectedRoute>
            }
          />

          {/* HR */}
          <Route
            path="/hr/attendance"
            element={
              <ProtectedRoute roles={['HR']}>
                <HRAttendance />
              </ProtectedRoute>
            }
          />
          <Route
            path="/hr/leave"
            element={
              <ProtectedRoute roles={['HR']}>
                <HRLeave />
              </ProtectedRoute>
            }
          />



          {/* Protected Admin Routes */}

          <Route
            path="/admin/employee-attendance"
            element={
              <ProtectedRoute roles={['admin']}>
                <EmployeeAttendance />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/attendance-update-requests"
            element={
              <ProtectedRoute roles={['admin']}>
                <AttendanceUpdateRequests />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/leave-history"
            element={
              <ProtectedRoute roles={['admin']}>
                <LeaveHistory />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/manage-employee"
            element={
              <ProtectedRoute roles={['admin']}>
                <ManageEmployee />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/leave-plan"
            element={
              <ProtectedRoute roles={['admin']}>
                <LeavePlan />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/requests"
            element={
              <ProtectedRoute roles={['admin']}>
                <Requests />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/leave-cancel-requests"
            element={
              <ProtectedRoute roles={['admin']}>
                <LeaveCancelRequests />
              </ProtectedRoute>
            }
          />


        </Routes>
      </AuthProvider>
    </Router>


  );
}


export default App;
