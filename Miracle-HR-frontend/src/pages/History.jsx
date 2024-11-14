import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar'; 
import Sidebar from '../components/Menue'; 
import Heading from '../components/Heading'; 
import Card from '../components/Card'; 
import DynamicTable from '../components/Table'; 

const ApplyLeave = () => {
  // const columns = ['ID', 'Name', 'Email', 'Role'];

  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const result = [
        { first: '2024-10-07', last: '2024-10-10', days: 2, reason: 'Annual Leave' },
        { first: '2024-10-07', last: '2024-10-10', days: 2, reason: 'Annual Leave' },
        { first: '2024-10-07', last: '2024-10-10', days: 2, reason: 'Annual Leave' },
      ];
      setData(result);
    };
    
    fetchData();
  }, []);

  const columns = [
    { label: 'First Day of Absence', key: 'first' },
    { label: 'Last Day of Absence', key: 'last' },
    { label: 'No. of Days Absence', key: 'days' },
    { label: 'Reason', key: 'reason' },
  ];

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
            <DynamicTable columns={columns} data={data} />
          </div>
        </div> 
      </div>
    </div>
  );
};

export default ApplyLeave;
