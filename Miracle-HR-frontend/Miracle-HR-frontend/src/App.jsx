import React from 'react';
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import LeaveForm from "./pages/LeaveForm";
import Profile from "./pages/Profile";
import History from "./pages/History";
import Dashboard from "./pages/Dashboard";
import NavBar from "./components/Navbar";
import Menue from "./components/Menue";
import './index.css';
import EmployeeAttendance from './pages/Admin/EmployeeAttendance';
import Attendance from './pages/Attendance';
import LeaveHistory from './pages/Admin/LeaveHistory';
import ManageEmployee from './pages/Admin/ManageEmployee';
import Requests from './pages/Admin/Requests';


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
        <Route path="/profile" element={<Profile />} />
        <Route path="/history" element={<History />} />
        {/* <Route path="/admin" element={<Admin />} /> */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/admin/employee-attendance" element={<EmployeeAttendance />} />
        <Route path="/admin/leave-history" element={<LeaveHistory />} />
        <Route path="/admin/manage-employee" element={<ManageEmployee />} />
        <Route path="/admin/requests" element={<Requests />} />
        <Route path="/attendance" element={<Attendance />} />
      </Routes>
    </Router>
  );
}

export default App;
