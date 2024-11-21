import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Menue';
import Heading from '../components/Heading';
import DynamicTable from '../components/Table';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const Attendance = () => {
  const attendanceData = [
    { Date: '2024-10-01', SignIn: '8.30 a.m.', SignOff: '5.30 p.m', Hours: '9' },
    { Date: '2024-10-02', SignIn: '8.30 a.m.', SignOff: '5.30 p.m', Hours: '9' },
    { Date: '2024-10-03', SignIn: '8.30 a.m.', SignOff: '5.30 p.m', Hours: '9' },
    { Date: '2024-10-04', SignIn: '8.30 a.m.', SignOff: '5.30 p.m', Hours: '9' },
  ];

  const [selectedDate, setSelectedDate] = useState(null);

  const filteredData = selectedDate
    ? attendanceData.filter(item => {
        const itemDate = new Date(item.Date).toDateString();
        const selectedDateString = selectedDate.toDateString();
        return itemDate === selectedDateString;
      })
    : attendanceData;

  const columns = [
    { label: 'Attendance Date', key: 'Date' },
    { label: 'Sign in Time', key: 'SignIn' },
    { label: 'Sign off Time', key: 'SignOff' },
    { label: 'Total Hours', key: 'Hours' },
    { label: 'Action', key: 'action' },
  ];

  const handleApprove = (row) => {
    console.log('Approved:', row);
    // Approval logic here
  };

  const handleReject = (row) => {
    console.log('Rejected:', row);
    // Rejection logic here
  };

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

          <DynamicTable
            columns={columns}
            data={filteredData}
            Text1="Update"
            Text2="Cancel"
            Color1="#027bff"
            Color2="#c82333"
            onApprove={handleApprove}
            onReject={handleReject}
            showApproveButton={true}   // Decide to show the "Approve" button
            showRejectButton={false}    // Decide to show the "Reject" button
          />
        </div>
      </div>
    </div>
  );
};

export default Attendance;
