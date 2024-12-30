import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar'; 
import Sidebar from '../../components/Menue'; 
import Heading from '../../components/Heading'; 
import SubHeading from '../../components/SubHeading'; 
import DynamicTable from '../../components/Table'; 
import Card from '../../components/Card'; 
import CustomDialog from '../../components/Dialog';
import SimpleAlert from '../../components/Alert';
import axios from 'axios';
import axiosClient from '../../../axios-client';

const EmployeeManagement = () => {
  const [data, setData] = useState([]);
  const [updateData, setUpdateData] = useState([]);
  const [nameFilter, setNameFilter] = useState(''); 
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedLUId, setselectedLUId] = useState(null);
  const [selectedLId, setSelectedLId] = useState(null);
  const [selectedOFD, setSelectedOFD] = useState(null);
  const [selectedOLD, setSelectedOLD] = useState(null);
  const [selectedFD, setSelectedFD] = useState(null);
  const [selectedLD, setSelectedLD] = useState(null);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [selectedEmpId, setSelectedEmpId] = useState(null);
  const [selectedReason, setSelectedReason] = useState(null);
  const [selectedOR, setSelectedOR] = useState(null);
  const [selectedRep, setSelectedRep] = useState(null);
  const [selectedORep, setSelectedORep] = useState(null);
  const [selectedAction, setSelectedAction] = useState(null);
  const [updateLeaveData, setleaveData] = useState(null);
  const [editingRow, setEditingRow] = useState(null);
  const [updatedRowData, setUpdatedRowData] = useState({});
  const [isEditableDialogOpen, setIsEditableDialogOpen] = useState(false); 
  const [dialogActionType, setDialogActionType] = useState(null); 
  
  const [updateRequests, setUpdateRequests] = useState([]);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);  // State to manage confirmation dialog
  const [currentRequest, setCurrentRequest] = useState(null);  // To store current request data for approval/rejection

  const [showAlert, setShowAlert] = useState(false);
const [alertMessage, setAlertMessage] = useState('');
const [alertSeverity, setAlertSeverity] = useState('');

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
        return 'Casual Leave';
      case 'nopay':
        return 'No Pay Leave';
      default:
        return reason; // Fallback in case reason doesn't match any case
    }
  };

    // Helper function to format date and add one day
    const formatDate = (dateString) => {
      const date = new Date(dateString);
      date.setDate(date.getDate() + 1);  // Add one day to the date
      return date.toISOString().split('T')[0]; // Extracts 'YYYY-MM-DD'
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

  // Open dialog and set employee ID for deletion
  const openDialog = (row) => { 
    console.log('hi')
   setIsDialogOpen(true);
   setEditingRow(row);
  };

  // Close dialog and clear selected employee ID
  const closeDialog = () => {
    setIsDialogOpen(false);
    setselectedLUId(null);
   
  };


   // Handle delete action with confirmation
   const handleRemove = (row) => {
   
    console.log('DATA', row)
    setselectedLUId(row.l_u_id);
    setSelectedLId(row.leave_id);
    setSelectedEmpId(row.emp_id);
    setSelectedOFD(row.old_first_day);
    setSelectedOLD(row.old_last_day);
    setSelectedLeave(row.leave_type);
    setSelectedFD(row.first_day);
    setSelectedLD(row.last_day);
    setSelectedOR(row.old_reason);
    setSelectedReason(row.reason);
    setSelectedRep(row.representative);
    setSelectedORep(row.old_representative);
    setSelectedAction(row.action);
    setEditingRow(row);
    setDialogActionType('delete');
    openDialog(); // Open dialog and pass the employee l_u_id
  };

  // Confirm deletion, then proceed to delete employee
  const confirmDelete = () => {
    if (selectedLUId) {
      console.log('Attempting delete operations for:', selectedLUId);
  
      // Initialize the array of requests
      const requests = [];
  
      // Add the conditional delete request
      if (selectedAction === 'delete') {
        const D = calculateDays(selectedOFD,selectedOLD)

        requests.push(
          axiosClient.delete(`/admin/leave-cancel-cancel/${selectedLId}`)
        );

        if(selectedOR === 'Casual Leave' || selectedOR === 'Annual Leave' || selectedOR === 'No Pay Leave'){
          requests.push(
            axiosClient.put(`/admin/leave-cancel-cancel/${selectedEmpId}`,
            {
              // Data to be sent with the request
              reason: selectedOR,
              days: D,
              emp_id: selectedEmpId
            },)
          );
        }
        
      }
  
      // Add the main delete request
      requests.push(
        axiosClient.delete(`/admin/leave-cancel/${selectedLUId}`)
      );
  
      // Use Promise.all to ensure both requests succeed
      Promise.all(requests)
        .then((responses) => {
          responses.forEach((response, index) =>
            console.log(`Request ${index + 1} Successful:`, response.data)
          );
  
          setAlertMessage("Request Removed Successfully!");
          setAlertSeverity('success');
          setShowAlert(true);
          setTimeout(() => {
            setShowAlert(false);
          }, 5000);
  
          // Refresh the table and close the dialog
          fetchEmployees();
          closeDialog();
        })
        .catch(error => {
          console.error('Error during deletion:', error);
  
          setAlertMessage("Employee Removal Failed!");
          setAlertSeverity('error');
          setShowAlert(true);
          setTimeout(() => {
            setShowAlert(false);
          }, 5000);
  
          // Close the dialog even if there's an error
          closeDialog();
        });
    } else {
      console.log('noo');
    }
  };
  

 

 // Handle delete action with confirmation
 const handleApprove = (row) => {
  console.log('meow',row)
  setselectedLUId(row.l_u_id);
    setSelectedLId(row.leave_id);
    setSelectedEmpId(row.emp_id);
    setSelectedOFD(row.old_first_day);
    setSelectedOLD(row.old_last_day);
    setSelectedLeave(row.leave_type);
    setSelectedFD(row.first_day);
    setSelectedLD(row.last_day);
    setSelectedOR(row.old_reason);
    setSelectedReason(row.reason);
    setSelectedRep(row.representative);
    setSelectedORep(row.old_representative);
    setSelectedAction(row.action);
    setDialogActionType('update'); 
    setEditingRow(null)
  openDialog(); // Open dialog and pass the employee l_u_id
};

  // Confirm update
  const confirmApprove = () => {
    if (selectedLUId) {
      console.log('Attempting approve operations for:', selectedLUId);
  
      // Initialize the array of requests
      const requests = [];
  
      // Add the conditional delete request
      const D1 = calculateDays(selectedOFD,selectedOLD)
        const D2 = calculateDays(selectedFD,selectedLD)

        requests.push(
          axiosClient.put(`/admin/leave-approve-approve/${selectedLId}`,{
            
            leave_type:selectedLeave,
            first_day:selectedFD,
            last_day:selectedLD,
            days:D2,
            representative:selectedRep,
            reason:selectedReason
          })
        );

        if(selectedOR === 'Casual Leave' || selectedOR === 'Annual Leave' || selectedOR === 'No Pay Leave'){
          console.log('hiii 1')
          requests.push(
            axiosClient.put(`/admin/leave-approve/${selectedEmpId}`,
            {
              // Data to be sent with the request
              old_reason: selectedOR,
              reason:selectedReason,
              old_days: D1,
              days: D2,
              emp_id: selectedEmpId
            },)
          );
        }
        
      
  
      // Add the main delete request
      requests.push(
        axiosClient.delete(`/admin/leave-cancel/${selectedLUId}`)
      );
  
      // Use Promise.all to ensure both requests succeed
      Promise.all(requests)
        .then((responses) => {
          responses.forEach((response, index) =>
            console.log(`Request ${index + 1} Successful:`, response.data)
          );
  
          setAlertMessage("Request Approved Successfully!");
          setAlertSeverity('success');
          setShowAlert(true);
          setTimeout(() => {
            setShowAlert(false);
          }, 5000);
  
          // Refresh the table and close the dialog
          fetchEmployees();
          closeDialog();
        })
        .catch(error => {
          console.error('Error during deletion:', error);
  
          setAlertMessage("Employee Removal Failed!");
          setAlertSeverity('error');
          setShowAlert(true);
          setTimeout(() => {
            setShowAlert(false);
          }, 5000);
  
          // Close the dialog even if there's an error
          closeDialog();
        });
    } else {
      console.log('noo');
    }
  };


const fetchEmployees = () => {
  axiosClient.get('/admin/leave-update')
    .then(response => {
      console.log('action',response.data.data.action)
      if(response.data.status === 'success') {
        const deleteData = response.data.data.filter(request => request.action === 'delete');
        const updateData = response.data.data.filter(request => request.action === 'update');

        // Assuming response.data.data contains both login and leave_count data
        const delData = deleteData.map(request => ({
          ...request,
          first_day: formatDate(request.first_day),
          last_day: formatDate(request.last_day),
          old_first_day: formatDate(request.old_first_day),
          old_last_day: formatDate(request.old_last_day),
          leave_type: formatLeaveType(request.leave_type),
          reason: formatReason(request.reason),
          name: `${request.f_name || ''} ${request.l_name || ''}`.trim()  // Default to empty strings if name parts are missing
        }));
        setData(delData);


        const upData = updateData.map(request => ({
          ...request,
          first_day: formatDate(request.first_day),
          last_day: formatDate(request.last_day),
          old_first_day: formatDate(request.old_first_day),
          old_last_day: formatDate(request.old_last_day),
          leave_type: formatLeaveType(request.leave_type),
          reason: formatReason(request.reason),
          name: `${request.f_name || ''} ${request.l_name || ''}`.trim()  // Default to empty strings if name parts are missing
        }));
        setUpdateData(upData);
      }
    })
    .catch(error => {
      console.error('Error fetching employee data:', error);
      setAlertMessage("Failed To Load Employee Data!");
            setAlertSeverity('error');
            setShowAlert(true);
            setTimeout(() => {
              setShowAlert(false);
            }, 5000);
    });
};




  
  const cancelUpdate = () => {

  }
  
  useEffect(() => {
    fetchEmployees();
  }, []);

  

  // Filter data by employee name (first name or last name)
  const filteredData1 = data && data.length > 0
    ? data.filter(item =>
        !nameFilter || 
        `${item.f_name} ${item.l_name}`.toLowerCase().includes(nameFilter.toLowerCase())
      )
    : [];

    const filteredData2 = updateData && updateData.length > 0
    ? updateData.filter(item =>
        !nameFilter || 
        `${item.f_name} ${item.l_name}`.toLowerCase().includes(nameFilter.toLowerCase())
      )
    : [];


    console.log('Data 2',filteredData2)

const columns = [
  
  { label: 'Name', key: 'name' },
  { label: 'First Day of Absence', key: 'old_first_day' },
  { label: 'Last Day of Absence', key: 'old_last_day' },
  { label: 'Representative', key: 'old_representative' },
  { label: 'Reason', key: 'old_reason' },
  { label: 'Leave Type', key: 'old_leave_type' },
  { label: 'Action', key: 'action' },
  
];


return (
  <div className="flex flex-col h-screen">
    <Navbar />
    <div className="flex flex-grow">
      <Sidebar />
      <div className="flex-1 p-20">
       <div className="flex-1 mb-5 ">
       <div className={`flex-1 mb-5 ${showAlert ? "fixed top-0 left-0 w-full z-50" : ""}`}>
    {showAlert && (
      <SimpleAlert severity={alertSeverity} message={alertMessage} />
    )}
  </div>
      </div>
        <Heading text="Admin" />
        
        <div className='mt-12 mb-10'>
          <SubHeading text="Leave Cancel Requests" />
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

        
<CustomDialog
  isOpen={isDialogOpen}
  title="Confirm Action"
  message={
    dialogActionType === 'delete'
      ? "Are you sure you want to cancel this leave?"
      : "Are you sure you want to update this leave?"
  }
  onClose={closeDialog}
  onConfirm={dialogActionType === 'delete' ? confirmDelete : confirmApprove}
/>


        {/* Render the Dynamic Table */}
        <DynamicTable
          columns={columns}
          data={filteredData1} // Pass the filtered employee data
          
          Text2="Cancel Leave"
         
          Color2="#c82333"
          
          onReject={handleRemove}
          
          showRejectButton={true}    
        />

<div className='mt-20 mb-10'>
          <SubHeading text="Leave Update Requests" />
        </div>
        <div className="mt-10">
 
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
    {filteredData2.map((item, index) => (
      <Card
        key={index}
        data={item}
        onApprove={(data) => handleApprove(data)} // Approve handler
        onReject={(data) => handleRemove(data)}  // Reject handler
      />
    ))}
  </div>
</div>

      </div>
    </div>
  </div>
);
}

export default EmployeeManagement;