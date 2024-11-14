import React, { useState } from 'react';
import Navbar from '../components/Navbar'; // Adjust the import path according to your file structure
import Sidebar from '../components/Menue'; // Adjust the import path according to your file structure
import Heading from '../components/Heading'; // Import the Heading component
import DynamicTable from '../components/Table'; // Import your DynamicTable component
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const Attendance = () => {
  // Sample attendance data
  const attendanceData = [
    { Date: '2024-10-01', SignIn: '8.30 a.m.', SignOff:'5.30 p.m', Hours:'9' },
    { Date: '2024-10-02', SignIn: '8.30 a.m.', SignOff:'5.30 p.m', Hours:'9' },
    { Date: '2024-10-03', SignIn: '8.30 a.m.', SignOff:'5.30 p.m', Hours:'9' },
    { Date: '2024-10-04', SignIn: '8.30 a.m.', SignOff:'5.30 p.m', Hours:'9' },
    // Add more data as needed
  ];

  const [selectedDate, setSelectedDate] = useState(null);

  // Filter data for the selected date
  const filteredData = selectedDate
    ? attendanceData.filter(item => {
        const itemDate = new Date(item.Date).toDateString();
        const selectedDateString = selectedDate.toDateString();
        return itemDate === selectedDateString;
      })
    : attendanceData; // Show all data if no date is selected

  // Define columns with display names
  const columns = [
    { label: 'Attendance Date', key: 'Date' },
    { label: 'Sign in Time', key: 'SignIn' },
    { label: 'Sign off Time', key: 'SignOff' },
    { label: 'Total Hours', key: 'Hours' },
  ];

  return (
    <div className="flex flex-col h-screen">
      <Navbar />
      <div className="flex flex-grow">
        <Sidebar />
        <div className="flex-1 p-20">
          <Heading text="Attendance" />

          <div className="mb-20 flex items-center mt-20">
            <label className="mr-4 text-lg">Date:</label>
            <DatePicker
              selected={selectedDate}
              onChange={date => setSelectedDate(date)}
              dateFormat="yyyy/MM/dd"
              className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholderText="Select a date"
            />
          </div>

          {/* Table Component for Filtered Data */}
          <DynamicTable 
            columns={columns} // Pass columns array
            data={filteredData} 
          />
        </div>
      </div>
    </div>
  );
};

export default Attendance;
