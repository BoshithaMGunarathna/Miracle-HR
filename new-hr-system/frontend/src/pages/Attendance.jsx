import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Menue';
import Heading from '../components/Heading';
import DynamicTable from '../components/Table';
import DatePicker from 'react-datepicker';
import SimpleAlert from '../components/Alert';
import CustomDialog from '../components/Dialog';
import 'react-datepicker/dist/react-datepicker.css';
import axios from 'axios';

const Attendance = () => {
  const [attendance, setAttendanceData] = useState([]); 
  const [showAlert, setShowAlert] = useState(false);
const [alertMessage, setAlertMessage] = useState('');
const [alertSeverity, setAlertSeverity] = useState('');
const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedEmpId, setSelectedEmpId] = useState(null);
  const [editingRow, setEditingRow] = useState(null);
  const [updatedRowData, setUpdatedRowData] = useState({});
  const [isEditableDialogOpen, setIsEditableDialogOpen] = useState(false); 
const [loading, setLoading] = useState(true);
const [selectedDate, setSelectedDate] = useState(null);
const [startDate, setStartDate] = useState(null);
const [endDate, setEndDate] = useState(null);

  // Open dialog and set employee ID for deletion
  const openDialog = (row) => {
    // setSelectedEmpId();
    setIsDialogOpen(true);
    setEditingRow(row);
  };

  // Close dialog and clear selected employee ID
  const closeDialog = () => {
    setIsDialogOpen(false);
    // setSelectedEmpId(null);
    setEditingRow(null);
  };


  const fetchAttendance = () => {
    const emp_id = localStorage.getItem("emp_id");
    axios.get(`http://localhost:8081/attendance/${emp_id}`)
      .then(response => {
        console.log('Fetched leave data:', response.data.data);
        setAttendanceData(response.data.data || []); // Fallback to empty array if data is null/undefined
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching employee data:', error);
        setAlertMessage("Failed To Load Attendance Data!");
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


  const confirmDelete = () => {
    if (!editingRow) return; // Safety check in case no row is selected
  
    // Prepare the delete attendance data
    const deleteAttendanceData = {
      emp_id: editingRow.emp_id,
      attendance_id: editingRow.attendance_id,
      action: "delete",
      old_date: editingRow.date,
      old_sign_in: editingRow.sign_in,
      old_sign_out: editingRow.sign_out,
    };
  
    console.log('Deleting Attendance Record:', deleteAttendanceData);
  
    // Send the delete request
    axios.post(`http://localhost:8081/attendance-update`, deleteAttendanceData)
      .then(response => {
        console.log('Delete Successful:', response.data);
        setAlertMessage("Attendance Cancel Request Sent Successfully!");
        setAlertSeverity('success');
        setShowAlert(true);
  
        // Remove the deleted row from the state
        // setAttendanceData(prevData =>
        //   prevData.filter(item => item.attendance_id !== editingRow.attendance_id)
        // );
  
        // Close the dialog
        closeDialog();
  
        setTimeout(() => {
          setShowAlert(false);
        }, 5000);
      })
      .catch(error => {
        console.error('Error deleting attendance record:', error);
        setAlertMessage("Failed to Send Attendance Cancel Request");
        setAlertSeverity('error');
        setShowAlert(true);
  
        setTimeout(() => {
          setShowAlert(false);
        }, 5000);
      });
  };
  

  const confirmUpdate = () => {
    // const attendanceId = updatedRowData.attendance_id;
    console.log('updateeeeeeeee', updatedRowData);
  
    // Prepare the employee update data
    const updatedAttendanceData = {
      emp_id: editingRow.emp_id,
      attendance_id:editingRow.attendance_id,
      date: updatedRowData.date,
      sign_in: updatedRowData.sign_in,
      sign_out: updatedRowData.sign_out,
      action: "update",
      old_date:editingRow.date,
      old_sign_in:editingRow.sign_in,
      old_sign_out:editingRow.sign_out
      
    };
 console.log('updatedAttendanceData',updatedAttendanceData)
    // Update the employee data
    axios.post(`http://localhost:8081/attendance-update`, updatedAttendanceData)
      .then(response => {
        console.log('Update Successful:', response.data);
        setAlertMessage("Attendance Update Request Send Successfully!");
            setAlertSeverity('success');
            setShowAlert(true);
            setTimeout(() => {
              setShowAlert(false);
            }, 5000);
        setIsEditableDialogOpen(false); // Close the editable dialog after update
      })
      .catch(error => {
        console.error('Error updating data!', error);
        setIsEditableDialogOpen(false); // Close the editable dialog if there's an error
        setAlertMessage("Failed To Send Attendance Update Request");
            setAlertSeverity('error');
            setShowAlert(true);
            setTimeout(() => {
              setShowAlert(false);
            }, 5000);
      });
  };


  const formatDate = (date) => {
    const d = new Date(date);
    d.setDate(d.getDate() + 1); // Add one day
    return d.toISOString().split('T')[0]; // Strip off time part, get 'YYYY-MM-DD'
  };
  

  const filteredData = (startDate && endDate)
    ? attendance.filter(item => {
      const itemDate = new Date(item.date);
  
      const normalizedItemDate = itemDate.toISOString().split('T')[0];
      const normalizedStartDate = startDate ? startDate.toISOString().split('T')[0] : null;
      const normalizedEndDate = endDate ? endDate.toISOString().split('T')[0] : null;

      // Check if the item date is within the selected range
      const matchesDate = normalizedStartDate && normalizedEndDate
        ? normalizedItemDate >= normalizedStartDate && normalizedItemDate <= normalizedEndDate
        : true;
        return matchesDate;
      })
      : attendance || [];


      const formattedData = Array.isArray(filteredData) ? filteredData.map(item => {
        return {
          ...item,
          date: formatDate(item.date), // Format date
        };
      }) : [];
      

  const columns = [
    { label: 'Date', key: 'date' },
    { label: 'Sign in Time', key: 'sign_in' },
    { label: 'Sign off Time', key: 'sign_out' },
    { label: 'Total Hours', key: 'hours' },
    { label: 'Action', key: 'action' },
  ];


  
  
 
  
    // Handle input change in the edit mode
    const handleInputChange = (e, key) => {
      setUpdatedRowData(prevData => ({
        ...prevData,
        [key]: e.target.value
      }));
    };

    
  const handleEdit = (row) => {
    console.log('Approved:', row);
    setUpdatedRowData({ ...row });
    setEditingRow(row);
    setIsEditableDialogOpen(true);
    // Approval logic here
  };

  const handleReject = (row) => {
    console.log('Removing Attendance Record:', row);
    openDialog(row); // Pass the selected row data to openDialog
  };
  

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
          <Heading text="Attendance" />
          <div className="mb-20 flex items-center mt-20">
            <label className="mr-4 text-lg">Date:</label>
            <DatePicker
    selected={startDate}
    onChange={(dates) => {
      setStartDate(dates[0]);
      setEndDate(dates[1]);
    }}
    startDate={startDate}
    endDate={endDate}
    selectsRange
    dateFormat="yyyy/MM/dd"
    className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
    placeholderText="Select a date range"
  />
          </div>


          <CustomDialog
          isOpen={isDialogOpen}
          title="Confirm Action"
          message={"Are you sure you want to remove this leave record? This will send a Request to the Admin for Approval."}
          onClose={closeDialog}
          onConfirm={confirmDelete}
        />

        {/* Editable Row as Dialog */}
        <CustomDialog
  isOpen={isEditableDialogOpen}
  title="Edit Employee"
  message={
    <>
      <div className="flex flex-col">
        <label htmlFor="date" className="text-lg font-medium mb-2">Date</label>
        <input
          type="date"
          value={updatedRowData.date}
          onChange={(e) => handleInputChange(e, 'date')}
          className="border px-4 py-2 mb-4"
          placeholder="Date"
        />
        
        {/* Employee Contact Info */}
        <label htmlFor="sign_in" className="text-lg font-medium mb-2">Sign In</label>
        <input
          type="time"
          value={updatedRowData.sign_in}
          onChange={(e) => handleInputChange(e, 'sign_in')}
          className="border px-4 py-2 mb-4"
          placeholder="Sign in Time"
        />

        <label htmlFor="sign_out" className="text-lg font-medium mb-2">Sign Off</label>
        <input
          type="time"
          value={updatedRowData.sign_out}
          onChange={(e) => handleInputChange(e, 'sign_out')}
          className="border px-4 py-2 mb-4"
          placeholder="Sign off Time"
        />

       

        <button
          className="text-white py-2 px-4 rounded"
          style={{
            backgroundColor: "#218838",
            color: "#fff",
          }}
          onClick={confirmUpdate}
        >
          Update
        </button>
      </div>
    </>
  }
  onClose={() => setIsEditableDialogOpen(false)} // Close editable dialog
/>

          <DynamicTable
            columns={columns}
            data={formattedData}
            Text1="Update"
            Text2="Remove"
            Color1="#027bff"
            Color2="#c82333"
            onApprove={handleEdit}
            onReject={handleReject}
            showApproveButton={true}   // Decide to show the "Approve" button
            showRejectButton={true}    // Decide to show the "Reject" button
          />
        </div>
      </div>
    </div>
  );
};

export default Attendance;
