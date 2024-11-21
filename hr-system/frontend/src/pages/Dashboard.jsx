import React, { useState, useEffect } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Menue';
import Heading from '../components/Heading';
import LeaveCount from '../components/LCount'; 
import 'react-datepicker/dist/react-datepicker.css';
import axios from 'axios';


ChartJS.register(ArcElement, Tooltip, Legend);

const Dashboard = () => {
  const emp_id = localStorage.getItem("emp_id"); 
  const [annualLeaveCount, setAnnualLeaveCount] = useState(0);
  const [casualLeaveCount, setCasualLeaveCount] = useState(0);
  const [annualLeaveTaken, setAnnualLeaveTaken] = useState(0);
  const [casualLeaveTaken, setCasualLeaveTaken] = useState(0);
  const [nopayLeaveTaken, setNopayLeaveTaken] = useState(0);

  console.log(emp_id)

  useEffect(() => {
    // Fetch leave count data and representatives list
    axios.get(`http://localhost:8081/dashboard/${emp_id}`)
      .then(response => {
        if (response.data.status === "success") {
        
          const leave = response.data.data;
       
            setAnnualLeaveCount(leave.annual_leave_count);
            setCasualLeaveCount(leave.cassual_leave_count);
            setAnnualLeaveTaken(leave.annual_leave_taken);
            setCasualLeaveTaken(leave.cassual_leave_taken);
            setNopayLeaveTaken(leave.nopay_leave_taken);
        
        } else {
          console.error("Failed to fetch leave count and representatives:", response.data.message);
        }
      })
      .catch(error => {
        console.error("There was an error fetching leave count data:", error);
      });
  }, [emp_id]);

  const calculateRemaining = (allowed, taken) => allowed - taken;

  const annualLeaveData = {
    labels: ['Taken', 'Remaining'],
    datasets: [
      {
        data: [annualLeaveTaken, calculateRemaining(annualLeaveCount, annualLeaveTaken)],
        backgroundColor: ['#FF6384', '#36A2EB'],
        hoverBackgroundColor: ['#FF6384', '#36A2EB'],
      },
    ],
  };

  const casualLeaveData = {
    labels: ['Taken', 'Remaining'],
    datasets: [
      {
        data: [casualLeaveTaken, calculateRemaining(casualLeaveCount, casualLeaveTaken)],
        backgroundColor: ['#FF9F40', '#4BC0C0'],
        hoverBackgroundColor: ['#FF9F40', '#4BC0C0'],
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
      },
    },
  };

  return (
    <div className="flex flex-col h-screen">
      <Navbar />
      <div className="flex flex-grow">
        <Sidebar />
        <div className="flex-1 p-20">
          <Heading text="Dashboard" />
          <div className="mt-20 flex flex-col md:flex-row justify-between items-start space-y-10 md:space-y-0 md:space-x-10">
            <div className="flex flex-col md:flex-row justify-center space-x-0 md:space-x-40">
              <div className="mb-10 md:mb-0" style={{ width: '300px', height: '300px' }}>
                <h3 style={{ color: '#6e2878' }} className="text-center font-bold mb-4">Annual Leaves</h3>
                <Doughnut data={annualLeaveData} options={options} />
              </div>

              <div className="mb-10 md:mb-0" style={{ width: '300px', height: '300px' }}>
                <h3 style={{ color: '#6e2878' }} className="text-center font-bold mb-4">Casual Leaves</h3>
                <Doughnut data={casualLeaveData} options={options} />
              </div>
            </div>

            {/* No Pay Leaves Display */}
            <div className="mt-10 md:mt-0">
              <LeaveCount 
                label="Number of No Pay Leaves Taken" 
                count={nopayLeaveTaken} 
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
