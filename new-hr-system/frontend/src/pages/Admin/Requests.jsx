import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Menue';
import Heading from '../../components/Heading';
import SubHeading from '../../components/SubHeading';
import DynamicTable from '../../components/Table';
import SimpleAlert from '../../components/Alert';
import 'react-datepicker/dist/react-datepicker.css';


const Requests = () => {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);  // State to manage confirmation dialog
  const [currentRequest, setCurrentRequest] = useState(null);  // To store current request data for approval/rejection

  const [showAlert, setShowAlert] = useState(false);
const [alertMessage, setAlertMessage] = useState('');
const [alertSeverity, setAlertSeverity] = useState('');

  // Helper function to format date and add one day
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    date.setDate(date.getDate() + 1);  // Add one day to the date
    return date.toISOString().split('T')[0]; // Extracts 'YYYY-MM-DD'
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
        return 'Casual Leave';
      case 'nopay':
        return 'No Pay Leave';
      default:
        return reason; // Fallback in case reason doesn't match any case
    }
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

  useEffect(() => {
    // Fetch leave requests from the backend API
    axios.get("http://localhost:8081/admin/requests")
      .then(response => {
        if (response.data.status === "success") {
          // Format the dates, leave types, and reasons before setting them in state
          const formattedData = response.data.data.map(request => ({
            ...request,
            first_day: formatDate(request.first_day),
            last_day: formatDate(request.last_day),
            leave_type: formatLeaveType(request.leave_type),
            reason: formatReason(request.reason),
            name: `${request.f_name || ''} ${request.l_name || ''}`.trim()  // Default to empty strings if name parts are missing
          }));
          setLeaveRequests(formattedData);
        } else {
          console.error("Failed to load leave requests:", response.data.message);
          setAlertMessage("Failed to Load Leave Requests!");
            setAlertSeverity('error');
            setShowAlert(true);
            setTimeout(() => {
              setShowAlert(false);
            }, 5000);

        }
      })
      .catch(error => {
        console.error("There was an error fetching leave requests:", error);
       
        setAlertMessage("Failed to Load Leave Requests!");
            setAlertSeverity('error');
            setShowAlert(true);
            setTimeout(() => {
              setShowAlert(false);
            }, 5000);
      });
  }, []);
  

  const columns1 = [ 
    { label: 'Employee ID', key: 'emp_id' },
    { label: 'Name', key: 'name' },
    { label: 'Leave Type', key: 'leave_type' },
    { label: 'Reason', key: 'reason' },
    { label: 'First Day of Absence', key: 'first_day' },
    { label: 'Last Day of Absence', key: 'last_day' },
    { label: 'Representative', key: 'representative' },
    { label: 'Action', key: 'action' },
  ];
  
  // Updating the Approve and Reject actions to use leave_request_id
  const handleApprove = (row) => {
    setIsConfirmOpen(true);
    setCurrentRequest({ action: 'approve', row });
  };
  
  const handleReject = (row) => {
    setIsConfirmOpen(true);
    setCurrentRequest({ action: 'reject', row });
  };
  
  const confirmAction = () => {
    if (!currentRequest) return;
  
    const { action, row } = currentRequest;
    const daysTaken = calculateDays(row.first_day, row.last_day);
    const requestData = { ...row, days: daysTaken };
    console.log('request data', requestData.reason)
  
    if (action === 'approve') {
   
      axios.post("http://localhost:8081/admin/requests", requestData)
        .then(response => {
          if (response.data.status === "success") {
            

            setAlertMessage("Leave Approved Successfully!");
            setAlertSeverity('success');
            setShowAlert(true);
            setTimeout(() => {
              setShowAlert(false);
            }, 5000);

            setLeaveRequests(prevRequests => prevRequests.filter(request => request.leave_request_id !== row.leave_request_id));
            setIsConfirmOpen(false);
          } else {
           

            setAlertMessage("Failed to Approve the Leave Request!");
            setAlertSeverity('error');
            setShowAlert(true);
            setTimeout(() => {
              setShowAlert(false);
            }, 5000);
          }
        })
        .catch(error => {
          setIsConfirmOpen(false);
          console.error("Error approving the leave:", error);
         

          setAlertMessage("Failed to Approve the Leave Request!");
            setAlertSeverity('error');
            setShowAlert(true);
            setTimeout(() => {
              setShowAlert(false);
            }, 5000);
        });
    } else if (action === 'reject') {
      
      axios.delete(`http://localhost:8081/admin/requests/${row.leave_request_id}`)
        .then(response => {
          if (response.data.status === "success") {
            
            setAlertMessage("Leave Request Removed Successfully!");
            setAlertSeverity('success');
            setShowAlert(true);
            setTimeout(() => {
              setShowAlert(false);
            }, 5000);
            setLeaveRequests(prevRequests => prevRequests.filter(request => request.leave_request_id !== row.leave_request_id));
            setIsConfirmOpen(false);
          } else {
           

            setAlertMessage("Leave Request Removal Failed");
            setAlertSeverity('error');
            setShowAlert(true);
            setTimeout(() => {
              setShowAlert(false);
            }, 5000);
          }
        })
        .catch(error => {
          
          console.error("Error rejecting the leave:", error);
        

          setAlertMessage("Leave Request Removal Failed");
            setAlertSeverity('error');
            setShowAlert(true);
            setTimeout(() => {
              setShowAlert(false);
            }, 5000);
        });
    }
  };
  
  const cancelAction = () => {
    setIsConfirmOpen(false);  // Close the dialog without performing any action
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

          <Heading text="Admin" />
          <div className='mt-10 mb-10'>
            <SubHeading text="Leave Requests" />
          </div>

           {/* Confirmation Dialog */}
      {isConfirmOpen && (
        <div className="fixed inset-0 flex justify-center items-center bg-gray-500 bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-md">
            <h3 className="text-lg font-semibold">Are you sure?</h3>
            <p className="mt-4">Do you want to {currentRequest?.action} this leave request?</p>
            <div className="mt-4 flex justify-end space-x-4">
              <button
                onClick={cancelAction}
                className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={confirmAction}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
          <DynamicTable
            columns={columns1}
            data={leaveRequests}
            Text1='Approve'
            Text2='Reject'
            Color1='#218838'
            Color2='#c82333'
            onApprove={handleApprove}
            onReject={handleReject}
            showApproveButton={true}
            showRejectButton={true}
          />
        </div>
      </div>

     
    </div>
  );
};

export default Requests;
