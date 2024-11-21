import React from 'react';
import Navbar from '../components/Navbar'; // Adjust the import path according to your file structure
import Sidebar from '../components/Menue'; // Adjust the import path according to your file structure
import Heading from '../components/Heading'; // Import the Heading component
import { FaPhoneAlt } from "react-icons/fa";
import { MdEmail } from "react-icons/md";
import person from "../assets/images/person.jpg";

import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const Profile = () => {

    // const { emp_id } = useParams(); // Get emp_id from route parameter
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const emp_id = localStorage.getItem("emp_id");
    const token = localStorage.getItem("token");

    axios
      .get(`http://localhost:8081/profile/${emp_id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      .then((res) => {
        if (res.data.status === "success") {
          setUserData(res.data.data);
        } else {
          console.error(res.data.message);
        }
      })
      .catch((err) => {
        console.error("Error fetching profile data:", err);
      });
  }, []);


  if (!userData) return <p>Loading...</p>;
 
  return (
    <div>
      <Navbar />
      <div className="flex">
        <Sidebar />
        <div className="flex-1 p-20">
          <Heading text="Profile" />

          {/* Card Wrapper */}
          <div className="flex justify-center items-center h-[60vh] mt-10">
            <div className="max-w-sm max-h-m bg-white rounded-lg shadow-md overflow-hidden">
              {/* Top Part with Gradient */}
              <div className="bg-gradient-to-r from-[#6E2878] to-[#034E7C] h-32 relative">
                {/* User Image (Centered on the Border) */}
                <div className="absolute inset-x-0 top-full transform -translate-y-1/2 flex justify-center">
                  <img
                    className="w-36 h-36 rounded-full border-4 border-white" // Increased size here
                    src={'http://localhost:8081/images/'+ userData.photo}
                    alt="User Profile Picture"
                  />
                </div>
              </div>

              {/* Bottom Part with White Background */}
              <div className="p-6 mt-12 text-center">
                <h2 className="text-lg font-semibold text-gray-900 mt-6">{userData.f_name} {userData.l_name}</h2>
                <p className="text-gray-800">{userData.position}</p>
                
                <p className="mt-6 text-gray-600 mb-5">
                {userData.description}
                </p>

                <div className="flex items-center p-2 justify-center">
                  <FaPhoneAlt size={20} className='mr-5 text-gray-800' /> 0{userData.c_number}
                </div>
                <div className="flex items-center p-2 justify-center">
                  <MdEmail size={20} className='mr-5 text-gray-800' /> {userData.email}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;