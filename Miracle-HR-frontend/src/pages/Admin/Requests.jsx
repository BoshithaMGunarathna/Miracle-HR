import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar'; // Adjust the import path according to your file structure
import Sidebar from '../../components/Menue'; // Adjust the import path according to your file structure
import Heading from '../../components/Heading'; // Import the Heading component
import SubHeading from '../../components/SubHeading'; 
import DynamicTable from '../../components/Table'; // Import your DynamicTable component
import 'react-datepicker/dist/react-datepicker.css';
import axios from 'axios';

const Requests = () => {
  // State to hold leave requests data from the backend
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [loading, setLoading] = useState(true); // For loading state
  const [updatingId, setUpdatingId] = useState(null); // To track the leave request being updated
  const [statusUpdateInProgress, setStatusUpdateInProgress] = useState(false); // Disable buttons during update

  // Fetch leave requests data from API
  useEffect(() => {
    const fetchLeaveRequests = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/leave');
        setLeaveRequests(response.data.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching leave requests:', error);
        setLoading(false);
      }
    };

    fetchLeaveRequests();
  }, []);

  // Handle approve button click
  const handleApprove = async (leaveId) => {
    const confirmed = window.confirm('Are you sure you want to approve this leave request?');
    if (confirmed) {
      setUpdatingId(leaveId);
      setStatusUpdateInProgress(true);
      try {
        const response = await axios.put(`http://localhost:5000/api/leave/${leaveId}/status`, { status: 'approved' });
        setLeaveRequests((prevRequests) =>
          prevRequests.map((leave) =>
            leave._id === leaveId ? { ...leave, status: 'approved' } : leave
          )
        );
        alert('Leave status updated to Approved.');
      } catch (error) {
        console.error('Error updating leave status:', error);
        alert('Failed to update leave status.');
      } finally {
        setStatusUpdateInProgress(false);
      }
    }
  };

  // Handle reject button click
  const handleReject = async (leaveId) => {
    const confirmed = window.confirm('Are you sure you want to reject this leave request?');
    if (confirmed) {
      setUpdatingId(leaveId);
      setStatusUpdateInProgress(true);
      try {
        const response = await axios.put(`http://localhost:5000/api/leave/${leaveId}/status`, { status: 'rejected' });
        setLeaveRequests((prevRequests) =>
          prevRequests.map((leave) =>
            leave._id === leaveId ? { ...leave, status: 'rejected' } : leave
          )
        );
        alert('Leave status updated to Rejected.');
      } catch (error) {
        console.error('Error updating leave status:', error);
        alert('Failed to update leave status.');
      } finally {
        setStatusUpdateInProgress(false);
      }
    }
  };

  // Columns for the leave request table
  const columns1 = [
    // { label: 'Employee ID', key: '_id' },
    { label: 'Name', key: 'firstName' },
    { label: 'Leave Type', key: 'leaveType' },
    { label: 'Reason', key: 'reason' },
    { label: 'Start Date', key: 'startDate' },
    { label: 'End Date', key: 'endDate' },
    { label: 'Status', key: 'status' },
    { label: 'Action', key: 'action' },
  ];

  return (
    <div className="flex flex-col h-screen" >
      <Navbar />
      <div className="flex flex-grow">
        <Sidebar />
        <div className="flex-1 p-20">
          <Heading text="Admin" />
          <div className="mt-10 mb-10">
            <SubHeading text="Leave Requests" />
          </div>
          {loading ? (
            <div>Loading...</div>
          ) : (
            <DynamicTable
              columns={columns1}
              data={leaveRequests}
              Text1="Approve"
              Text2="Reject"
              Color1="#218838"
              Color2="#c82333"
              onApprove={(row) => handleApprove(row._id)}  
              onReject={(row) => handleReject(row._id)}    
              disabled={statusUpdateInProgress}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Requests;
