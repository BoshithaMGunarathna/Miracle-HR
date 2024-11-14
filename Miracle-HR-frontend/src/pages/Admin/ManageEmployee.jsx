import React, { useState } from 'react';
import Navbar from '../../components/Navbar'; // Adjust the import path according to your file structure
import Sidebar from '../../components/Menue'; // Adjust the import path according to your file structure
import Heading from '../../components/Heading'; // Import the Heading component
import SubHeading from '../../components/SubHeading'; 
import DynamicTable from '../../components/Table'; // Import your DynamicTable component

const EmployeeManagement = () => {
  // Sample employee data
  const employeeData = [
    { id: 'E001', name: 'John Doe', jobRole: 'Software Engineer', phone: '123-456-7890', email: 'john@example.com', leavesAllowed: 12 },
    { id: 'E002', name: 'Jane Smith', jobRole: 'Project Manager', phone: '987-654-3210', email: 'jane@example.com', leavesAllowed: 15 },
    { id: 'E003', name: 'Alice Johnson', jobRole: 'UI/UX Designer', phone: '555-123-4567', email: 'alice@example.com', leavesAllowed: 10 },
    { id: 'E004', name: 'Bob Brown', jobRole: 'DevOps Engineer', phone: '444-987-6543', email: 'bob@example.com', leavesAllowed: 8 },
    // Add more employee data as needed
  ];

  const [nameFilter, setNameFilter] = useState(''); // State for name filter

  // Filter data for the name
  const filteredData = employeeData.filter(item => 
    item.name.toLowerCase().includes(nameFilter.toLowerCase()) // Check if name matches filter
  );

  const columns = [
    { label: 'Employee ID', key: 'id' },
    { label: 'Name', key: 'name' },
    { label: 'Job Role', key: 'jobRole' },
    { label: 'Phone Number', key: 'phone' },
    { label: 'Email', key: 'email' },
    { label: 'No. of Leaves Allowed', key: 'leavesAllowed' },
    { label: 'Action', key: 'action' }, // Action column
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
          
          <div className='mt-12 mb-10'>
            <SubHeading text="Employee Management" />
          </div>

          {/* Filter for Employee Name */}
          <div className="mb-10 flex items-center">
            <label className="mr-2 text-lg">Name:</label>
            <input
              type="text"
              value={nameFilter}
              onChange={e => setNameFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter a name"
            />
          </div>

          {/* Render the Dynamic Table */}
          <DynamicTable 
  columns={columns} // Pass columns array
  data={filteredData} 
  Text1='Update'
  Text2='Delete'
  Color1='#027bff' // Custom color for approve button
  Color2='#c82333' // Custom color for reject button
  onApprove={handleApprove} // Pass approve handler
  onReject={handleReject} // Pass reject handler
/>
        </div>
      </div>
    </div>
  );
};

export default EmployeeManagement;
