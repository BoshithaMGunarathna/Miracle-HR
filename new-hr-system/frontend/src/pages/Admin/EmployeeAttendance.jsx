import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar'; 
import Sidebar from '../../components/Menue'; 
import Heading from '../../components/Heading'; 
import SubHeading from '../../components/SubHeading'; 
import DynamicTable from '../../components/Table'; 
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import axios from 'axios';
import SimpleAlert from '../../components/Alert';

const AttendanceHistory = () => {
  const [attendanceHistory, setAttendanceHistory] = useState([]); 
  const [selectedDate, setSelectedDate] = useState(null);
  const [nameFilter, setNameFilter] = useState(''); 
  const [loading, setLoading] = useState(true);
  const [showAlert, setShowAlert] = useState(false);
const [alertMessage, setAlertMessage] = useState('');
const [alertSeverity, setAlertSeverity] = useState('');
const [startDate, setStartDate] = useState(null);
const [endDate, setEndDate] = useState(null);


  const fetchAttendance = () => {
    axios.get('http://localhost:8081/hr/attendance')
      .then(response => {
        if (response.data.status === "error") {
          console.warn('No leave requests found');
          setAlertMessage("No Attendance Data Found");
        setAlertSeverity('error');
        setShowAlert(true);
        setTimeout(() => {
          setShowAlert(false);
        }, 5000);
        setLoading(false);
          setAttendanceHistory([]); // Set attendanceHistory to an empty array
        } else {
          console.log('Fetched leave data:', response.data.data);
          setAttendanceHistory(response.data.data); // Set leave data into state
        }
        setLoading(false); // Stop loading once data is fetched
      })
      .catch(error => {
        console.error('Error fetching leave data:', error);
        setAlertMessage("Error Fetching Attendance Data");
        setAlertSeverity('error');
        setShowAlert(true);
        setTimeout(() => {
          setShowAlert(false);
        }, 5000);
        setLoading(false);
      });
  };
  

  // Fetch data on component mount
  useEffect(() => {
    fetchAttendance();
  }, []);

  // Format the date to 'YYYY-MM-DD' and add one day to the fetched date
  const formatDate = (date) => {
    const d = new Date(date);
    d.setDate(d.getDate() + 1); // Add one day
    return d.toISOString().split('T')[0]; // Strip off time part, get 'YYYY-MM-DD'
  };



  // Filter data for the selected date and name
  const filteredData = attendanceHistory.filter(item => {
    // Parse the date from your data (assume it's in 'YYYY-MM-DD' format)
    const itemDate = new Date(item.date);
  
  
    // Match only if the selected date is null or matches the item date
    const matchesDateRange =
    (startDate && endDate) 
      ? itemDate >= startDate && itemDate <= endDate
      : true;
  
    // Name filter logic (unchanged)
    const fullName = `${item.f_name} ${item.l_name}`.toLowerCase().trim();
    const matchesName = nameFilter 
      ? fullName.includes(nameFilter.toLowerCase().trim()) 
      : true;
  
    return matchesDateRange && matchesName;
  });
  

  
  console.log("Filtered Data: ", filteredData); // Log the filtered data for debugging

  // Update columns to include the calculated leave days
  const columns = [
    { label: 'Employee ID', key: 'emp_id' },
    { label: 'Name', key: 'name' },
    { label: 'Date', key: 'date' },
    { label: 'Sign In', key: 'sign_in' },
    { label: 'Sign Off', key: 'sign_out' },
    { label: 'Hours', key: 'hours' },
   
  ];

  // Ensure data is formatted before passing to DynamicTable
  const formattedData = filteredData.map(item => {
    return {
      ...item,
      name: `${item.f_name} ${item.l_name}`,
      date: formatDate(item.date), // Format date
      
    };
  });
  
  return (
    <div className="flex flex-col h-screen">
      <Navbar />
      <div className="flex flex-grow">
        <Sidebar />
        <div className="flex-1 p-20">
        <div className={`flex-1 mb-5 ${showAlert ? "fixed top-0 left-0 w-full z-50" : ""}`}>
    {showAlert && (
      <SimpleAlert severity={alertSeverity} message={alertMessage} />
    )}
  </div>
          <Heading text="Admin" />
          
          <div className='mt-12 mb-10'>
            <SubHeading text="Employee Attendance" />
          </div>

          {/* Flex container for filters */}
          <div className="mb-20 flex items-center mt-10 space-x-4">
            <div className="flex items-center mr-20">
              <label className="mr-2 text-lg">Date:</label>
              <DatePicker
  selectsRange
  startDate={startDate}
  endDate={endDate}
  onChange={(update) => {
    setStartDate(update[0]);
    setEndDate(update[1]);
  }}
  dateFormat="yyyy/MM/dd"
  className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
  placeholderText="Select date range"
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
              columns={columns} // Pass columns array without date formatting
              data={formattedData} // Pass formatted data
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default AttendanceHistory;
