import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar'; 
import Sidebar from '../components/Menue'; 
import Heading from '../components/Heading'; 


const ApplyLeave = () => {
  

  return (
    <div>
      <Navbar />
      <div className="flex">
        <Sidebar />
        <div className="flex-1 p-20">
          <Heading text="Dashboard" />
         
        </div> 
      </div>
    </div>
  );
};

export default ApplyLeave;
