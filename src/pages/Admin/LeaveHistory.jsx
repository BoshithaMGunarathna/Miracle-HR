import React, { useState } from 'react';
import Navbar from '../../components/Navbar'; // Adjust the import path according to your file structure
import Sidebar from '../../components/Menue'; // Adjust the import path according to your file structure
import Heading from '../../components/Heading'; // Import the Heading component
import SubHeading from '../../components/SubHeading'; 
import DynamicTable from '../../components/Table'; // Import your DynamicTable component
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const LeaveHistory = () => {
  // Sample attendance data
  const attendanceData = [
    { id: '123', name: 'John', reason: 'Annual Leave', firstDay: '2024-10-07', lastDay: '2024-10-10', days: '3' },
    { id: '124', name: 'Doe', reason: 'Sick Leave', firstDay: '2024-10-01', lastDay: '2024-10-02', days: '2' },
    { id: '125', name: 'Alice', reason: 'Personal Leave', firstDay: '2024-10-05', lastDay: '2024-10-05', days: '1' },
    // Add more data as needed
  ];

  const [selectedDate, setSelectedDate] = useState(null);
  const [nameFilter, setNameFilter] = useState(''); // State for name filter

  // Filter data for the selected date and name
  const filteredData = attendanceData.filter(item => {
    const firstDay = new Date(item.firstDay);
    const lastDay = new Date(item.lastDay);
    const matchesDate = selectedDate ? selectedDate >= firstDay && selectedDate <= lastDay : true; // Check if selectedDate falls within firstDay and lastDay
    const matchesName = item.name.toLowerCase().includes(nameFilter.toLowerCase()); // Check if name matches filter
    return matchesDate && matchesName; // Filter based on both criteria
  });

  const columns2 = [
    { label: 'Employee ID', key: 'id' },
    { label: 'Name', key: 'name' },
    { label: 'Reason', key: 'reason' },
    { label: 'First Day of Absence', key: 'firstDay' },
    { label: 'Last Day of Absence', key: 'lastDay' },
    { label: 'No. of Days Absence', key: 'days' },
  
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

          <DynamicTable 
            columns={columns2} // Pass columns array
            data={filteredData} 
          />
        </div>
      </div>
    </div>
  );
};

export default LeaveHistory;
