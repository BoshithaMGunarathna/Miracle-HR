import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar'; 
import Sidebar from '../../components/Menue'; 
import Heading from '../../components/Heading'; 
import SubHeading from '../../components/SubHeading'; 
import DynamicTable from '../../components/Table'; 
import Card from '../../components/Card'; 
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import CustomDialog from '../../components/Dialog';
import SimpleAlert from '../../components/Alert';
import axios from 'axios';
import axiosClient from '../../../axios-client';

const EmployeeManagement = () => {

  const [nameFilter, setNameFilter] = useState(''); 
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedLUId, setselectedLUId] = useState(null);
  const [editingRow, setEditingRow] = useState(null);
  const [dialogActionType, setDialogActionType] = useState(null); 
  const [attendanceHistory, setAttendanceHistory] = useState([]); 
  const [selectedDate, setSelectedDate] = useState(null);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertSeverity, setAlertSeverity] = useState('');

    // Helper function to format date and add one day
    const formatDate = (dateString) => {
      const date = new Date(dateString);
      date.setDate(date.getDate() + 1);  // Add one day to the date
      return date.toISOString().split('T')[0]; // Extracts 'YYYY-MM-DD'
    };

  // Open dialog and set employee ID for deletion
  const openDialog = (action,row) => { 
    setDialogActionType(action);
   setIsDialogOpen(true);
   setEditingRow(row);
  };

  // Close dialog and clear selected employee ID
  const closeDialog = () => {
    setIsDialogOpen(false);
    setselectedLUId(null);
   
  };

  const handleAction = () => {
    if (!editingRow) return;
    console.log('editingRow',editingRow)
    const requests = [];
    if (dialogActionType === 'delete') {
      requests.push(
        axiosClient.delete(`/admin/attendance-update-cancel/${editingRow.a_u_id}`)
      );
    } 
    else if (dialogActionType === 'update') {
      requests.push(
        axiosClient.delete(`/admin/attendance-update-cancel/${editingRow.a_u_id}`)
      );
      if(editingRow.action==='delete'){
        requests.push(
          axiosClient.delete(`/admin/attendance-update-approve/${editingRow.attendance_id}`)
        );
      }
      else if (editingRow.action==='update'){
        const data = {
          attendance_id:editingRow.attendance_id,
          emp_id: editingRow.emp_id,
          date: editingRow.date,
          sign_in: editingRow.sign_in,
          sign_out: editingRow.sign_out,
          hours: editingRow.hours,
        };
        requests.push(
          axiosClient.put(`/admin/attendance-update-approve/${editingRow.attendance_id}`, data)
        );
      }
    }

    Promise.all(requests)
      .then(() => {
        setAlertMessage(dialogActionType === 'delete' ? "Request Removed Successfully!" : "Request Updated Successfully!");
        setAlertSeverity('success');
        fetchAttendance();
      })
      .catch((error) => {
        console.error('Error during action:', error);
        setAlertMessage("Action Failed!");
        setAlertSeverity('error');
      })
      .finally(() => {
        setShowAlert(true);
        setTimeout(() => setShowAlert(false), 5000);
        closeDialog();
      });
  };

  const fetchAttendance = () => {
    axiosClient
      .get('/admin/attendance-update')
      .then((response) => {
        if (response.data.status === "error") {
          console.warn('No attendance data found');
          setAlertMessage("No Attendance Data Found");
          setAlertSeverity('error');
          setShowAlert(true);
          setTimeout(() => {
            setShowAlert(false);
          }, 5000);
  
          setAttendanceHistory([]); // Set attendanceHistory to an empty array
        } else {
          console.log('Fetched attendance data:', response.data.data);
          setAttendanceHistory(response.data.data); // Set attendance data into state
        }
      })
      .catch((error) => {
        console.error('Error fetching attendance data:', error);
        setAlertMessage("Error Fetching Attendance Data");
        setAlertSeverity('error');
        setShowAlert(true);
        setTimeout(() => {
          setShowAlert(false);
        }, 5000);
        setLoading(false);
      });
  };
  

  useEffect(() => {
    fetchAttendance();
  }, []);

  // Helper function to calculate hours and minutes
const calculateHours = (signIn, signOut) => {
  if (!signIn || !signOut) return null; // Return null if either value is missing

  const signInTime = new Date(`1970-01-01T${signIn}`);
  const signOutTime = new Date(`1970-01-01T${signOut}`);

  const differenceInMilliseconds = signOutTime - signInTime;
  if (differenceInMilliseconds < 0) return null; // Handle invalid time ranges

  const hours = Math.floor(differenceInMilliseconds / (1000 * 60 * 60));
  const minutes = Math.floor((differenceInMilliseconds % (1000 * 60 * 60)) / (1000 * 60));

  return `${hours}h ${minutes}m`;
};
  // Filter data by employee name (first name or last name)
  const filteredData = attendanceHistory.filter(item => {
    // Parse the dates from your data (assume they're in 'YYYY-MM-DD' format)
    const itemDate1 = new Date(item.date);
    const itemDate2 = new Date(item.old_date);
  
    // Normalize the dates by stripping the time information
    const normalizedItemDate1 = itemDate1.toISOString().split('T')[0];
    const normalizedItemDate2 = itemDate2.toISOString().split('T')[0];
    const normalizedSelectedDate = selectedDate
      ? selectedDate.toISOString().split('T')[0]
      : null;
  
    // Match only if the selected date is null or matches one of the item dates
    const matchesDate = normalizedSelectedDate
      ? normalizedItemDate1 === normalizedSelectedDate || normalizedItemDate2 === normalizedSelectedDate
      : true;
  
    // Name filter logic
    const fullName = `${item.f_name} ${item.l_name}`.toLowerCase().trim();
    const matchesName = nameFilter
      ? fullName.includes(nameFilter.toLowerCase().trim())
      : true;
  
    // Return true if both date and name filters match
    return matchesDate && matchesName;
  });
  
  const formattedData1 = filteredData.filter(item => item.action === 'delete').map(item => ({
    ...item,
    name: `${item.f_name} ${item.l_name}`,
    date: formatDate(item.old_date), // Format date
    hours: calculateHours(item.old_sign_in, item.old_sign_out),
    
  }));

const formattedData2 = filteredData.filter(item => item.action === 'update').map(item => ({
    ...item,
    name: `${item.f_name} ${item.l_name}`,
    date: formatDate(item.date), // Format date
    old_date: formatDate(item.old_date),
    old_hours: calculateHours(item.old_sign_in, item.old_sign_out),
    hours: calculateHours(item.sign_in, item.sign_out),
  }));

const columns1 = [
  { label: 'Name', key: 'name' },
  { label: 'Date', key: 'date' },
  { label: 'Sing In', key: 'old_sign_in' },
  { label: 'Sign Off', key: 'old_sign_out' },
  { label: 'Hours', key: 'hours' },
  { label: 'Action', key: 'action' },
];

const columns2 = [
  { label: 'Name', key: 'name' },
  { label: 'Previous Date', key: 'old_date' },
  { label: 'New Date', key: 'date' },
  { label: 'Previous Sing In', key: 'old_sign_in' },
  { label: 'New Sing In', key: 'sign_in' },
  { label: 'Previous Sign Off', key: 'old_sign_out' },
  { label: 'New Sign Off', key: 'sign_out' },
  { label: 'Previous Hours', key: 'old_hours' },
  { label: 'New Hours', key: 'hours' },
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
        {/* Filter for Employee Name */}
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

          <div className='mt-12 mb-10'>
          <SubHeading text="Attendance Cancel Requests" />
        </div>
        
<CustomDialog
  isOpen={isDialogOpen}
  title="Confirm Action"
  message={dialogActionType === 'delete' ? "Do you want to remove this request?" : "Do you want to update attendance records?"}
            onConfirm={handleAction}
            onClose={closeDialog}/>
        {/* Render the Dynamic Table */}
        <DynamicTable
          columns={columns1}
          data={formattedData1} // Pass the filtered employee data
            Text1="Accept"
            Text2="Reject"
            Color1="#218838"
            Color2="#c82333"
            onApprove={(row) => openDialog('update', row)}
            onReject={(row) => openDialog('delete', row)}            
            showApproveButton={true}   // Decide to show the "Approve" button
            showRejectButton={true}   
        />

<div className='mt-20 mb-10'>
          <SubHeading text="Attendance Update Requests" />
        </div>
        <div className="mt-10">
  <DynamicTable
          columns={columns2}
          data={formattedData2} // Pass the filtered employee data
          Text1="Update"
            Text2="Reject"
            Color1="#027bff"
            Color2="#c82333"
            onApprove={(row) => openDialog('update', row)}
            onReject={(row) => openDialog('delete', row)}
            showApproveButton={true}   // Decide to show the "Approve" button
            showRejectButton={true}  
        />
</div>
      </div>
    </div>
  </div>
);
}

export default EmployeeManagement;