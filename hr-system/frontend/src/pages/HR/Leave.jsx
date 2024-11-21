import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar'; 
import Sidebar from '../../components/Menue'; 
import Heading from '../../components/Heading'; 
import SubHeading from '../../components/SubHeading'; 
import DynamicTable from '../../components/Table'; 
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import axios from 'axios';

const LeaveHistory = () => {
  const [leaveHistory, setLeaveHistory] = useState([]); 
  const [selectedDate, setSelectedDate] = useState(null);
  const [nameFilter, setNameFilter] = useState(''); 
  const [loading, setLoading] = useState(true);

  // Fetch employee leave history from API
  const fetchEmployees = () => {
    axios.get('http://localhost:8081/hr/leave')
      .then(response => {
        console.log('Fetched leave data:', response.data.data);
        setLeaveHistory(response.data.data); // Set leave data into state
        setLoading(false); // Stop loading once data is fetched
      })
      .catch(error => {
        console.error('Error fetching employee data:', error);
        setLoading(false);
      });
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchEmployees();
  }, []);

  // Format the date to 'YYYY-MM-DD' and add one day to the fetched date
  const formatDate = (date) => {
    const d = new Date(date);
    d.setDate(d.getDate() + 1); // Add one day
    return d.toISOString().split('T')[0]; // Strip off time part, get 'YYYY-MM-DD'
  };

  // Function to calculate the number of days between two dates
  const calculateDays = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Calculate the difference in time
    const differenceInTime = end.getTime() - start.getTime();

    // Convert the difference in time to days
    const differenceInDays = differenceInTime / (1000 * 3600 * 24);

    return Math.ceil(differenceInDays) + 1; // Adding 1 to include both start and end days
  };

  // Filter data for the selected date and name
  const filteredData = leaveHistory.filter(item => {
    const firstDay = new Date(item.first_day);
    const lastDay = new Date(item.last_day);
  
    // If a date is selected, check if the leave period overlaps with the selected date
    const matchesDate = selectedDate ? 
      (selectedDate >= firstDay && selectedDate <= lastDay) : true; // selectedDate should be between firstDay and lastDay, inclusive
  
    // Name filter logic
    const fullName = item.name.toLowerCase().trim();
    const matchesName = nameFilter ? 
      fullName.includes(nameFilter.toLowerCase().trim()) : true;
  
    // Return data only if both name and date filters match
    return matchesDate && matchesName;
  });
  
  console.log("Filtered Data: ", filteredData); // Log the filtered data for debugging

  // Update columns to include the calculated leave days
  const columns2 = [
    { label: 'Employee ID', key: 'emp_id' },
    { label: 'Name', key: 'name' },
    { label: 'Leave Type', key: 'leave_type' },
    { label: 'Reason', key: 'reason' },
    { label: 'First Day of Absence', key: 'first_day' },
    { label: 'Last Day of Absence', key: 'last_day' },
    { label: 'No. of Days Absence', key: 'days' },
    { label: 'Representative', key: 'representative' },
  ];

  // Ensure data is formatted before passing to DynamicTable
  const formattedData = filteredData.map(item => {
    return {
      ...item,
      first_day: formatDate(item.first_day), // Format date
      last_day: formatDate(item.last_day),  // Format date
      days: calculateDays(item.first_day, item.last_day), // Calculate leave days
    };
  });
  
  return (
    <div className="flex flex-col h-screen">
      <Navbar />
      <div className="flex flex-grow">
        <Sidebar />
        <div className="flex-1 p-20">
          <Heading text="Human Resource Management" />
          
          <div className='mt-12 mb-10'>
            <SubHeading text="Employee Leave History" />
          </div>

          {/* Flex container for filters */}
          <div className="mb-20 flex items-center mt-10 space-x-4">
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

          {/* Loading indicator */}
          {loading ? (
            <div className="text-center text-lg">Loading...</div>
          ) : (
            <DynamicTable 
              columns={columns2} // Pass columns array without date formatting
              data={formattedData} // Pass formatted data
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default LeaveHistory;
