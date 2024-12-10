import React from 'react';
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
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


function App() {
  return (
    // <div className="App">
    //    <NavBar />
    //   <Menue />
    // </div>

    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/leave" element={<LeaveForm />} />
        <Route path="/profile/:emp_id" element={<Profile />} />
        <Route path="/history" element={<History />} />
        {/* <Route path="/admin" element={<Admin />} /> */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/update-leave" element={<UpdateLeave />} />
        <Route path="/hr/attendance" element={<HRAttendance />} />
        <Route path="/hr/leave" element={<HRLeave />} />
        <Route path="/admin/employee-attendance" element={<EmployeeAttendance />} />
        <Route path="/admin/attendance-update-requests" element={<AttendanceUpdateRequests />} />
        <Route path="/admin/leave-history" element={<LeaveHistory />} />
        <Route path="/admin/manage-employee" element={<ManageEmployee />} />
        <Route path="/admin/leave-plan" element={<LeavePlan />} />
        <Route path="/admin/leave-cancel-requests" element={<LeaveCancelRequests />} />
        <Route path="/admin/requests" element={<Requests />} />
        <Route path="/attendance" element={<Attendance />} />
       
        <Route path="/mark-attendance" element={<MarkAttendance />} />
      </Routes>
    </Router>
  );
}

export default App;
