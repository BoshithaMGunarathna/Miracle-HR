import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar'; // Adjust the import path according to your file structure
import Sidebar from '../../components/Menue'; // Adjust the import path according to your file structure
import Heading from '../../components/Heading'; // Import the Heading component
import SubHeading from '../../components/SubHeading'; 
import DynamicTable from '../../components/Table'; // Import your DynamicTable component
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import axios from 'axios'; // Make sure to import axios for API calls

const LeaveHistory = () => {
  const [leaveRequests, setLeaveRequests] = useState([]); // To store leave requests data
  const [loading, setLoading] = useState(true); // Loading state to show a loading spinner or message
  const [selectedDate, setSelectedDate] = useState(null); // For date filter
  const [nameFilter, setNameFilter] = useState(''); // For name filter

  // Fetch only approved leave requests from the API
  useEffect(() => {
    const fetchApprovedLeaveRequests = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/leave'); // Update with the correct API URL
        const approvedRequests = response.data.data.filter(request => request.status === 'approved'); // Filter for approved leave requests
        setLeaveRequests(approvedRequests);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching leave requests:', error);
        setLoading(false);
      }
    };

    fetchApprovedLeaveRequests();
  }, []);


    // Calculate total leave days for each request
    const calculateTotalDays = (startDate, endDate) => {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffTime = Math.abs(end - start); // Difference in milliseconds
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // Convert milliseconds to days
      return diffDays;
    };



   // Filter the leave requests based on selected date and name
   const filteredData = leaveRequests.filter(item => {
    const firstDay = new Date(item.startDate); // Assuming startDate is the date the leave begins
    const lastDay = new Date(item.endDate); // Assuming endDate is the date the leave ends
    const matchesDate = selectedDate ? selectedDate >= firstDay && selectedDate <= lastDay : true; // Filter by date
    const matchesName = item.firstName.toLowerCase().includes(nameFilter.toLowerCase()); // Filter by name
    return matchesDate && matchesName; // Return filtered results
  });

  // Add total days column to the data
  const updatedData = filteredData.map(item => ({
    ...item,
    totalDays: calculateTotalDays(item.startDate, item.endDate) // Add totalDays field
  }));

  // Table columns
  const columns2 = [
   
    { label: 'Name', key: 'firstName' },
    { label: 'Leave Type', key: 'leaveType' },
    { label: 'Reason', key: 'reason' },
    { label: 'Start Date', key: 'startDate' },
    { label: 'End Date', key: 'endDate' },
    { label: 'Total Days', key: 'totalDays' },
    { label: 'Status', key: 'status' },
  ];

  return (
    <div className="flex flex-col h-screen">
      <Navbar />
      <div className="flex flex-grow">
        <Sidebar />
        <div className="flex-1 p-20">
          <Heading text="Admin" />
          
          <div className='mt-12 mb-10'>
            <SubHeading text="Leave History" />
          </div>

          {/* Flex container for filters */}
          <div className="mb-20 flex items-center mt-10 space-x-4"> {/* Added space-x-4 for spacing */}
            <div className="flex items-center mr-20">
              <label className="mr-2 text-lg">Date:</label>
              <DatePicker
                selected={selectedDate}
                onChange={date => setSelectedDate(date)}
                dateFormat="yyyy/MM/dd"
                className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholderText="Select a date"
              />
            </div>
            <div className="flex items-center">
              <label className="mr-2 text-lg">Name:</label>
              <input
                type="text"
                value={nameFilter}
                onChange={e => setNameFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter a name"
              />
            </div>
          </div>

          {/* Display loading message or the table */}
          {loading ? (
            <div>Loading...</div>
          ) : (
            <DynamicTable 
              columns={columns2} // Pass columns array
              data={updatedData} 
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default LeaveHistory;
