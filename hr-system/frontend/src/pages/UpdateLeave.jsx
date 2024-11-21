import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar'; 
import Sidebar from '../components/Menue'; 
import Heading from '../components/Heading'; 
import SubHeading from '../components/SubHeading'; 
import DynamicTable from '../components/Table'; 
import CustomDialog from '../components/Dialog';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const EmployeeManagement = () => {
  const [data, setData] = useState([]);
  const [leave, setLeave] = useState([]);
  const [nameFilter, setNameFilter] = useState(''); 
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedEmpId, setSelectedEmpId] = useState(null);
  const [editingRow, setEditingRow] = useState(null);
  const [updatedRowData, setUpdatedRowData] = useState({});
  const [isEditableDialogOpen, setIsEditableDialogOpen] = useState(false); 
  const emp_id = localStorage.getItem("emp_id"); 
  const navigate = useNavigate();

  // Open dialog and set employee ID for deletion
  const openDialog = (empId, row) => {
    setSelectedEmpId(empId);
    setIsDialogOpen(true);
    setEditingRow(row);
  };

  // Close dialog and clear selected employee ID
  const closeDialog = () => {
    setIsDialogOpen(false);
    setSelectedEmpId(null);
    setEditingRow(null);
  };

  // Confirm deletion, then proceed to delete employee
  const confirmDelete = () => {

  };

  // Handle delete action with confirmation
  const handleRemove = (row) => {
    openDialog(row.emp_id); // Open dialog and pass the employee ID
  };

 // Handle row edit mode toggle
  const handleEdit = (row) => {
    setUpdatedRowData({ ...row });
    setEditingRow(row);
    setIsEditableDialogOpen(true); // Open the editable dialog
    
    navigate('/leave', {
      state: {
        updatedRowData: { ...row },
      },
    });
    
  };
  console.log("Updated Row Data:", updatedRowData);


const fetchEmployees = () => {
  axios.get(`http://localhost:8081/update-leave/${emp_id}`)
    .then(response => {
      if(response.data.status === 'success') {
        console.log('Fetched leave data:', response.data.leaveData);
        // Assuming response.data.data contains both login and leave_count data
        setData(response.data.leaveData);
        setLeave(response.data.employeeData);
      }
    })
    .catch(error => {
      console.error('Error fetching employee data:', error);
    });
};



  // Confirm update
  const confirmUpdate = () => {
   
  };
  
  useEffect(() => {
    fetchEmployees();
    
  }, []);

 // Format the date to 'YYYY-MM-DD' and add one day to the fetched date
 const formatDate = (date) => {
  const d = new Date(date);
  d.setDate(d.getDate() + 1); // Add one day
  return d.toISOString().split('T')[0]; // Strip off time part, get 'YYYY-MM-DD'
};

  // Helper function to map leave type to readable name
  const formatLeaveType = (leaveType) => {
    switch (leaveType) {
      case 'normal':
        return 'Normal Leave';
      case 'half':
        return 'Half Day';
      case 'short':
        return 'Short Leave';
      default:
        return leaveType; // Fallback in case leaveType doesn't match any case
    }
  };

  // Helper function to map reason to readable name
  const formatReason = (reason) => {
    switch (reason) {
      case 'annual':
        return 'Annual Leave';
      case 'casual':
        return 'Reason';
      case 'nopay':
        return 'No Pay Leave';
      default:
        return reason; // Fallback in case reason doesn't match any case
    }
  };

const formattedData1 = data.map(item => {
  return {
    ...item,
    first_day: formatDate(item.first_day), // Format date
    last_day: formatDate(item.last_day),  // Format date
    leave_type: formatLeaveType(item.leave_type),
            reason: formatReason(item.reason),
    
  };
});

const formattedData2 = leave.map(item => {
  return {
    ...item,
    first_day: formatDate(item.first_day), // Format date
    last_day: formatDate(item.last_day),  // Format date
    leave_type: formatLeaveType(item.leave_type),
            reason: formatReason(item.reason),
    
  };
});

const columns = [
  { label: 'Leave Type', key: 'leave_type' },
  { label: 'First Day of Absence', key: 'first_day' },
  { label: 'Last Day of Absence', key: 'last_day' },
  { label: 'Reason', key: 'reason' },
  { label: 'Representative', key: 'representative' },
  { label: 'Action', key: 'action' },
];


return (
  <div className="flex flex-col h-screen">
    <Navbar />
    <div className="flex flex-grow">
      <Sidebar />
      <div className="flex-1 p-20 ">
        <Heading text="Update Leave Requests" />
        
        <div className='mt-12 mb-10'>
          <SubHeading text="Pending Requests" />
        </div>

        

        {/* Confirmation Dialog */}
        <CustomDialog
          isOpen={isDialogOpen}
          title="Confirm Action"
          message={editingRow ? "Are you sure you want to update this employee data?" : "Are you sure you want to delete this employee permanently?"}
          onClose={closeDialog}
          onConfirm={editingRow ? confirmUpdate : confirmDelete}
        />

        {/* Editable Row as Dialog */}
  
        {/* Render the Dynamic Table */}
        <DynamicTable
          columns={columns}
          data={formattedData1} // Pass the filtered employee data
          Text1="Update"
          Text2="Remove"
          Color1="#027bff"
          Color2="#c82333"
          onApprove={handleEdit}
          onReject={handleRemove}
          showApproveButton={true}  
          showRejectButton={true}    
        />


<div className='mt-12 mb-10'>
          <SubHeading text="Approved Requests" />
        </div>
        <DynamicTable
          columns={columns}
          data={formattedData2} // Pass the filtered employee data
          Text1="Update"
          Text2="Remove"
          Color1="#027bff"
          Color2="#c82333"
          onApprove={handleEdit}
          onReject={handleRemove}
          showApproveButton={true}  
          showRejectButton={true}    
        />
      </div>
    </div>
  </div>
);
}

export default EmployeeManagement;