import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar'; 
import Sidebar from '../components/Menue'; 
import Heading from '../components/Heading'; 
import SubHeading from '../components/SubHeading'; 
import DynamicTable from '../components/Table'; 
import CustomDialog from '../components/Dialog';
import SimpleAlert from '../components/Alert';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../../axios-client';

const EmployeeManagement = () => {
  const [data, setData] = useState([]);
  const [leave, setLeave] = useState([]);
  const [nameFilter, setNameFilter] = useState(''); 
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedEmpId, setSelectedEmpId] = useState(null);
  const [editingRow, setEditingRow] = useState(null);

  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertSeverity, setAlertSeverity] = useState('');

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
   
    if(updatedRowData.leave_request_id){
      closeDialog();
        axiosClient.delete(`/update-leave-request/${updatedRowData.leave_request_id}`)
          .then(response => {
            
            setAlertMessage('Request Removed Successfully!');
            setAlertSeverity('success');
            setShowAlert(true);
            setTimeout(() => {
              setShowAlert(false);
            }, 5000);
            // Fetch employees again to refresh the table after deletion
            fetchEmployees();
            // Close dialog after successful delete
          })
          .catch(error => {
            setAlertMessage("Can't Remove the Request!");
            setAlertSeverity('error');
            setShowAlert(true);
            setTimeout(() => {
              setShowAlert(false);
            }, 5000);
            console.error('Error deleting the data!', error);
            // Close dialog if there's an error
          });
      
      
    }
    else if(updatedRowData.leave_id){
      console.log('approved requests')
      axiosClient.post('/update-approved-leave/',updatedRowData)
          .then(response => {
            console.log('Delete Successful:', response.data);
         
            setAlertMessage('Leave Update Request Submitted Successfully!');
            setAlertSeverity('success');
            setShowAlert(true);
            setTimeout(() => {
              setShowAlert(false);
            }, 5000);
            closeDialog(); // Close dialog after successful delete
          })
          .catch(error => {
            console.error('Error deleting the data!', error);
            closeDialog(); // Close dialog if there's an error
          });
      
    }else{
      setAlertMessage("Can't Remove the Leave Reequest!");
            setAlertSeverity('error');
            setShowAlert(true);
            setTimeout(() => {
              setShowAlert(false);
            }, 5000);
    }
  };
  
  const handleRemove = (row) => {
    const updatedDataWithAction = { ...row, action: 'delete' };
    setUpdatedRowData(updatedDataWithAction);
    openDialog(row.emp_id); // Open dialog and pass the employee ID
    
  };

 // Handle row edit mode toggle
  const handleEdit = (row) => {
    const updatedDataWithAction = { ...row, action: 'update' };
    setUpdatedRowData(updatedDataWithAction);
    setEditingRow(row);
    setIsEditableDialogOpen(true); // Open the editable dialog
    
    navigate('/leave', {
      state: {
        updatedRowData: updatedDataWithAction,
        
      },
    });
    
  };
  console.log("Updated Row Data:", updatedRowData);


const fetchEmployees = () => {
  axiosClient.get(`/update-leave/${emp_id}`)
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

      <div className="flex-1 mb-5 ">
      <div className={`flex-1 mb-5 ${showAlert ? "fixed top-0 left-0 w-full z-50" : ""}`}>
    {showAlert && (
      <SimpleAlert severity={alertSeverity} message={alertMessage} />
    )}
  </div>
      </div>
        <Heading text="Update Leave Requests" />
        
        <div className='mt-12 mb-10'>
          <SubHeading text="Pending Requests" />
        </div>

        

        {/* Confirmation Dialog */}
        <CustomDialog
          isOpen={isDialogOpen}
          title="Confirm Action"
          message={editingRow ? "Are you sure you want to update this leave?" : "Are you sure you want to cancel this leave?"}
          onClose={closeDialog}
          onConfirm={editingRow ? confirmUpdate : confirmDelete}
        />

        {/* Editable Row as Dialog */}
 

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
  
        {/* Render the Dynamic Table */}
      


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