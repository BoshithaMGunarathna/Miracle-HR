import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar'; 
import Sidebar from '../components/Menue'; 
import Heading from '../components/Heading'; 
import Card from '../components/Card'; 
import DynamicTable from '../components/Table'; 
import axios from 'axios'; // Import axios for API requests

const ApplyLeave = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userData, setUserData] = useState(null);

  const getUserId = () => {
    const userDataCookie = document.cookie
      .split("; ")
      .find((row) => row.startsWith("userData="));
    return userDataCookie
      ? JSON.parse(decodeURIComponent(userDataCookie.split("=")[1]))
      : null;
  };

  // Fetch user data from cookies on initial render
  useEffect(() => {
    const storedUserData = getUserId();
    if (storedUserData) {
      setUserData(storedUserData);  // Set the userData from cookies
    }
  }, []);

  // Fetch leave data if userData is set
  useEffect(() => {
    const fetchData = async () => {
      if (!userData) {
        setError("User is not logged in");
        return;
      }

      try {
        const userId = userData.id; // Get userId from userData
        const response = await axios.get(`http://localhost:5000/api/leave/user/${userId}`);
        console.log(response.data);
        if (response.data && response.data.data) {
          setData(response.data.data); // Set the leave data in state
        } else {
          setData([]);  // Set empty array if no data is found
        }
      } catch (err) {
        setError("Failed to fetch leave applications");
      } finally {
        setLoading(false); // Set loading state to false after the request is completed
      }
    };

    if (userData) {
      fetchData(); // Fetch data only when userData is available
    }
  }, [userData]); // Dependency array: Re-fetch when userData changes

  const columns = [
    { label: 'First Day of Absence', key: 'startDate' },
    { label: 'Last Day of Absence', key: 'endDate' },
    { label: 'No. of Days Absence', key: 'days' }, // You can calculate this in the table
    { label: 'Reason', key: 'reason' },
    { label: 'Status', key: 'status' },
    {label:'LeaveType',key:'leaveType'} 
  ];

  const calculateDays = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)); // Convert time difference into days
  };

  return (
    <div>
      <Navbar />
      <div className="flex">
        <Sidebar />
        <div className="flex-1 p-20">
          <Heading text="Leave History" />
          <div className='mt-10 flex flex-row space-x-6'>
            <Card cardLabel='Total Leaves Allowed' cardText='28' />
            <Card cardLabel='No. of Leaves Taken' cardText='4' />
            <Card cardLabel='No. of Leaves Remaining' cardText='24' />
          </div>
          <div className="mt-20">
            {loading ? (
              <div>Loading...</div>
            ) : error ? (
              <div>{error}</div>
            ) : data.length === 0 ? (
              <div>No leave applications found</div>
            ) : (
              <DynamicTable columns={columns}
              data={data.map((leave) => ({
                ...leave,
                days: calculateDays(leave.startDate, leave.endDate),
              }))} />
            )}
          </div>
        </div> 
      </div>
    </div>
  );
};

export default ApplyLeave;
