import React, { useState } from 'react';
import Navbar from '../../components/Navbar'; // Adjust the import path according to your file structure
import Sidebar from '../../components/Menue'; // Adjust the import path according to your file structure
import Heading from '../../components/Heading'; // Import the Heading component
import SubHeading from '../../components/SubHeading'; 
import DynamicTable from '../../components/Table'; // Import your DynamicTable component
import 'react-datepicker/dist/react-datepicker.css';

const Requests = () => {
  // Sample attendance data
  const attendanceData = [
    { id: '123', name: 'John', reason:'Annual Leave',leaves:'4', firstDay:'2024-10-07', lastDay:'2024-10-10', days:'3' },
    { id: '124', name: 'Doe', reason:'Sick Leave',leaves:'4', firstDay:'2024-10-01', lastDay:'2024-10-02', days:'2' },
    { id: '125', name: 'Alice', reason:'Personal Leave',leaves:'4', firstDay:'2024-10-05', lastDay:'2024-10-05', days:'1' },
    // Add more data as needed
  ];

  const [selectedDate] = useState(null);

  // Filter data for the selected date
  const filteredData = selectedDate
    ? attendanceData.filter(item => {
        const itemDate = new Date(item.firstDay).toDateString(); // Change to use firstDay
        const selectedDateString = selectedDate.toDateString();
        return itemDate === selectedDateString;
      })
    : attendanceData; // Show all data if no date is selected

  // Define columns with display names
  const columns1 = [
    { label: 'Employee ID', key: 'id' },
    { label: 'Name', key: 'name' },
    { label: 'Reason', key: 'reason' },
    { label: 'Remaining no.of Leaves', key: 'leaves' },
    { label: 'First Day of Absence', key: 'firstDay' },
    { label: 'Last Day of Absence', key: 'lastDay' },
    { label: 'No. of Days Absence', key: 'days' },
    { label: 'Action', key: 'action' }, // Add Action column
  ];

  const handleApprove = (row) => {
    console.log('Update:', row);
    // Add your approval logic here
  };

  const handleReject = (row) => {
    console.log('Delete:', row);
    // Add your rejection logic here
  };

  return (
    <div className="flex flex-col h-screen">
      <Navbar />
      <div className="flex flex-grow">
        <Sidebar />
        <div className="flex-1 p-20">
          <Heading text="Admin" />
          <div className='mt-10 mb-10'>
            <SubHeading text="Leave Requests" />
          </div>
          <DynamicTable 
            columns={columns1} // Pass columns array
            data={filteredData} 
            Text1='Approve'
  Text2='Reject'
  Color1='#218838' // Custom color for approve button
  Color2='#c82333' // Custom color for reject button
  onApprove={handleApprove} // Pass approve handler
  onReject={handleReject} 
          />


       
          
        </div>
      </div>
    </div>
  );
};

export default Requests;

