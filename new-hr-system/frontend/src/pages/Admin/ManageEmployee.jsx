import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar'; 
import Sidebar from '../../components/Menue'; 
import Heading from '../../components/Heading'; 
import SubHeading from '../../components/SubHeading'; 
import DynamicTable from '../../components/Table'; 
import CustomDialog from '../../components/Dialog';
import SimpleAlert from '../../components/Alert';
import axios from 'axios';

const EmployeeManagement = () => {
  const [data, setData] = useState([]);
  const [nameFilter, setNameFilter] = useState(''); 
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedEmpId, setSelectedEmpId] = useState(null);
  const [editingRow, setEditingRow] = useState(null);
  const [updatedRowData, setUpdatedRowData] = useState({});
  const [isEditableDialogOpen, setIsEditableDialogOpen] = useState(false); 

  const [showAlert, setShowAlert] = useState(false);
const [alertMessage, setAlertMessage] = useState('');
const [alertSeverity, setAlertSeverity] = useState('');

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
    if (selectedEmpId) {
      axios.delete(`http://localhost:8081/admin/manage-employee/${selectedEmpId}`)
        .then(response => {
          console.log('Delete Successful:', response.data);
          setAlertMessage("Employee Removed Successfully!");
            setAlertSeverity('success');
            setShowAlert(true);
            setTimeout(() => {
              setShowAlert(false);
            }, 5000);
          // Fetch employees again to refresh the table after deletion
          fetchEmployees();
          closeDialog(); // Close dialog after successful delete
        })
        .catch(error => {
          console.error('Error deleting the data!', error);

          closeDialog(); // Close dialog if there's an error
          setAlertMessage("Employee Removal Failed!");
            setAlertSeverity('error');
            setShowAlert(true);
            setTimeout(() => {
              setShowAlert(false);
            }, 5000);
        });
    }
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
  };

  // Handle input change in the edit mode
  const handleInputChange = (e, key) => {
    setUpdatedRowData(prevData => ({
      ...prevData,
      [key]: e.target.value
    }));
  };


const fetchEmployees = () => {
  axios.get('http://localhost:8081/admin/manage-employee')
    .then(response => {
      if(response.data.status === 'success') {
        // Assuming response.data.data contains both login and leave_count data
        setData(response.data.data);
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



  // Confirm update
  const confirmUpdate = () => {
    const empId = updatedRowData.emp_id;
    console.log('updateeeeeeeee', updatedRowData);
  
    // Prepare the employee update data
    const updatedEmployeeData = {
      emp_id: empId,
      position: updatedRowData.position,
      c_number: updatedRowData.c_number,
      e_number: updatedRowData.e_number,
      annual_leave_count: updatedRowData.annual_leave_count,
      cassual_leave_count: updatedRowData.cassual_leave_count,
      
      email: updatedRowData.email
    };
  
    // Update the employee data
    axios.put(`http://localhost:8081/admin/manage-employee/${empId}`, updatedEmployeeData)
      .then(response => {
        console.log('Update Successful:', response.data);
        setAlertMessage("Employee Details Updated Successfully!");
            setAlertSeverity('success');
            setShowAlert(true);
            setTimeout(() => {
              setShowAlert(false);
            }, 5000);
      
  
        // Refresh the data after update
        fetchEmployees(); // Refresh employee data after update
        setIsEditableDialogOpen(false); // Close the editable dialog after update
      })
      .catch(error => {
        console.error('Error updating data!', error);
        setIsEditableDialogOpen(false); // Close the editable dialog if there's an error
        setAlertMessage("Failed To Update Employee Data");
            setAlertSeverity('error');
            setShowAlert(true);
            setTimeout(() => {
              setShowAlert(false);
            }, 5000);
      });
  };
  
  useEffect(() => {
    fetchEmployees();
  }, []);

  // Log data to ensure it's being set correctly
  console.log('Data:', data);

  // Filter data by employee name (first name or last name)
  const filteredData = data && data.length > 0
    ? data.filter(item =>
        !nameFilter || 
        `${item.f_name} ${item.l_name}`.toLowerCase().includes(nameFilter.toLowerCase())
      )
    : [];
console.log('Filtered Data:', filteredData);

const columns = [
  { label: 'Employee ID', key: 'emp_id' },
  { label: 'First Name', key: 'f_name' },
  { label: 'Last Name', key: 'l_name' },
  { label: 'Job Role', key: 'position' },
  { label: 'Phone Number', key: 'c_number' },
  { label: 'Emergency Number', key: 'e_number' },
  { label: 'Email', key: 'email' },
  { label: 'Annual Leaves', key: 'annual_leave_count' },
  { label: 'Casual Leaves', key: 'cassual_leave_count' },
  // { label: 'Annual Leaves Taken', key: 'annual_leave_taken' },
  // { label: 'Casual Leaves Taken', key: 'cassual_leave_taken' },
  // { label: 'No-Pay Leaves Taken', key: 'nopay_leave_taken' },
  { label: 'Action', key: 'action' },
];


  // Update employee by employee ID



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

        {/* Confirmation Dialog */}
        <CustomDialog
          isOpen={isDialogOpen}
          title="Confirm Action"
          message={editingRow ? "Are you sure you want to update this employee data?" : "Are you sure you want to remove this employee permanently?"}
          onClose={closeDialog}
          onConfirm={editingRow ? confirmUpdate : confirmDelete}
        />

        {/* Editable Row as Dialog */}
        <CustomDialog
  isOpen={isEditableDialogOpen}
  title="Edit Employee"
  message={
    <>
      <div className="flex flex-col">
        <label htmlFor="position" className="text-lg font-medium mb-2">Position</label>
        <input
          type="text"
          value={updatedRowData.position}
          onChange={(e) => handleInputChange(e, 'position')}
          className="border px-4 py-2 mb-4"
          placeholder="Position"
        />
        
        {/* Employee Contact Info */}
        <label htmlFor="c_number" className="text-lg font-medium mb-2">Contact Number</label>
        <input
          type="text"
          value={updatedRowData.c_number}
          onChange={(e) => handleInputChange(e, 'c_number')}
          className="border px-4 py-2 mb-4"
          placeholder="Contact Number"
        />

        <label htmlFor="e_number" className="text-lg font-medium mb-2">Emergency Number</label>
        <input
          type="text"
          value={updatedRowData.e_number}
          onChange={(e) => handleInputChange(e, 'e_number')}
          className="border px-4 py-2 mb-4"
          placeholder="Emergency Number"
        />

        {/* Leave Info */}
        <label htmlFor="annual_leave_count" className="text-lg font-medium mb-2">Annual Leave</label>
        <input
          type="number"
          value={updatedRowData.annual_leave_count}
          onChange={(e) => handleInputChange(e, 'annual_leave_count')}
          className="border px-4 py-2 mb-4"
          placeholder="Annual Leave Count"
        />

        <label htmlFor="cassual_leave_count" className="text-lg font-medium mb-2">Casual Leave</label>
        <input
          type="number"
          value={updatedRowData.cassual_leave_count}
          onChange={(e) => handleInputChange(e, 'cassual_leave_count')}
          className="border px-4 py-2 mb-4"
          placeholder="Casual Leave Count"
        />

        

        <label htmlFor="email" className="text-lg font-medium mb-2">Email</label>
        <input
          type="text"
          value={updatedRowData.email}
          onChange={(e) => handleInputChange(e, 'email')}
          className="border px-4 py-2 mb-4"
          placeholder="Email"
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


        {/* Render the Dynamic Table */}
        <DynamicTable
          columns={columns}
          data={filteredData} // Pass the filtered employee data
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