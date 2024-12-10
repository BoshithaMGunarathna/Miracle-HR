import React, { useState, useEffect } from 'react';
import { FaWalking, FaRegUser, FaUserCheck, FaHistory, FaBars, FaTimes, FaChevronDown } from 'react-icons/fa';
import { MdSpaceDashboard, MdAdminPanelSettings, MdManageAccounts } from "react-icons/md";
import { NavLink } from "react-router-dom";
import { MdPublishedWithChanges } from "react-icons/md";
import { TbExchange } from "react-icons/tb";
import { HiMiniCheckCircle } from "react-icons/hi2";
import { RxUpdate } from "react-icons/rx";
import axios from 'axios'; // Assuming you use axios for API calls


const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false); // Admin dropdown toggle
  const [hrOpen, setHROpen] = useState(false); // HR dropdown toggle
  const [userEmail, setUserEmail] = useState(null); // To store logged-in user's email
  const empId = localStorage.getItem("emp_id");

  
  console.log('empId from localStorage:', empId);


  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const toggleAdmin = () => {
    setIsOpen(true); // Expand sidebar when Admin is clicked
    setAdminOpen(!adminOpen); // Toggle Admin dropdown
  };

  const toggleHR = () => {
    setIsOpen(true); // Expand sidebar when HR is clicked
    setHROpen(!hrOpen); // Toggle HR dropdown
  };

   // Fetch user email based on emp_id
   useEffect(() => {
    axios.get(`http://localhost:8081/api/user-email/${empId}`)
      .then(response => {
        if (response.data.status === "error" || !response.data.data || response.data.data.length === 0) {
          console.warn('No user email found:', response.data.message);
        } else {
          console.log('Email fetched:', response.data.data[0].email);
          setUserEmail(response.data.data[0].email);
        }
      })
      .catch(error => {
        console.error('Error fetching user email:', error);
      });
  }, [empId]);
  
  

  return (
    <div className={`flex ${isOpen ? 'w-64' : 'w-16'} bg-gradient-to-b from-[#6E2878] to-[#034E7C] text-white shadow-md transition-all duration-300`}>
      <div className="flex flex-col w-full">
        <div className="flex items-center justify-between p-4">
          <button onClick={toggleSidebar} className="focus:outline-none">
            {isOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
          </button>
          <span className={isOpen ? 'block text-lg font-semibold' : 'hidden'} />
        </div>

        <ul className="mt-4">
        {userEmail !== 'b@gmail.com' && ( //admin email
             <>
         
         <li className="flex items-center p-2 hover:bg-[#034e7c]">
            <NavLink to="/mark-attendance" className="flex items-center w-full">
              <HiMiniCheckCircle size={20} className="mr-2 ml-2 mb-4 mt-3" />
              <span className={`${isOpen ? 'block' : 'hidden'} ml-4`}>Mark Attendance</span>
            </NavLink>
          </li>

          <li className="flex items-center p-2 hover:bg-[#034e7c]">
            <NavLink to="/attendance" className="flex items-center w-full">
              <FaUserCheck size={20} className="mr-2 ml-2 mb-4 mt-3" />
              <span className={`${isOpen ? 'block' : 'hidden'} ml-4`}>Attendance</span>
            </NavLink>
          </li>
         
          <li className="flex items-center p-2 hover:bg-[#034e7c]">
            <NavLink to="/leave" className="flex items-center w-full">
              <FaWalking size={20} className="mr-2 ml-2 mb-4 mt-3" />
              <span className={`${isOpen ? 'block' : 'hidden'} ml-4`}>Apply Leave</span>
            </NavLink>
          </li>
          <li className="flex items-center p-2 hover:bg-[#034e7c]">
            <NavLink to="/update-leave" className="flex items-center w-full">
              <TbExchange size={20} className="mr-2 ml-2 mb-4 mt-3" />
              <span className={`${isOpen ? 'block' : 'hidden'} ml-4`}>Update Leave</span>
            </NavLink>
          </li>
          <li className="flex items-center p-2 hover:bg-[#034e7c]">
            <NavLink to="/history" className="flex items-center w-full">
              <FaHistory size={20} className="mr-2 ml-2 mb-4 mt-3" />
              <span className={`${isOpen ? 'block' : 'hidden'} ml-4`}>Leave History</span>
            </NavLink>
          </li>
          <li className="flex items-center p-2 hover:bg-[#034e7c]">
            <NavLink to="/dashboard" className="flex items-center w-full">
              <MdSpaceDashboard size={20} className="mr-2 ml-2 mb-4 mt-3" />
              <span className={`${isOpen ? 'block' : 'hidden'} ml-4`}>Dashboard</span>
            </NavLink>
          </li>
</>
)}
          {/* Human Resource with Attendance and Leave sub-items */}


          {userEmail === 'a@gmail.com' && (   //hr email
             <>
          <li className="flex items-center p-2 hover:bg-[#034e7c] cursor-pointer" onClick={toggleHR} aria-haspopup="true" aria-expanded={hrOpen}>
            <MdManageAccounts size={20} className="mr-2 ml-2 mb-4 mt-3" />
            <span className={`${isOpen ? 'block' : 'hidden'} ml-4`}>Human Resource</span>
            {isOpen && (
              <FaChevronDown
                size={14}
                className={`ml-auto transition-transform ${hrOpen ? 'rotate-180' : ''}`}
                aria-hidden="true"
              />
            )}
          </li>
          {hrOpen && isOpen && (
            <ul className="ml-8 pl-8">
              <li className="flex items-center p-2 mt-4 hover:bg-[#034e7c]">
                <NavLink to="/hr/attendance" className="w-full">Attendance</NavLink>
              </li>
              <li className="flex items-center p-2 mt-4 hover:bg-[#034e7c]">
                <NavLink to="/hr/leave" className="w-full">Leave</NavLink>
              </li>
            </ul>
          )}
          </>
        )}

          {/* Admin with Leave Requests, Leave History, Attendance, and Manage Employee sub-items */}


          {userEmail === 'b@gmail.com' && (   //admin email
             <>
          {/* <li className="flex items-center p-2 hover:bg-[#034e7c] cursor-pointer" onClick={toggleAdmin} aria-haspopup="true" aria-expanded={adminOpen}>
            <MdAdminPanelSettings size={20} className="mr-2 ml-2 mb-4 mt-3" />
            <span className={`${isOpen ? 'block' : 'hidden'} ml-4`}>Admin</span>
            {isOpen && (
              <FaChevronDown
                size={14}
                className={`ml-auto transition-transform ${adminOpen ? 'rotate-180' : ''}`}
                aria-hidden="true"
              />
            )}
          </li> */}
          {/* {adminOpen && isOpen && ( */}
            {/* <ul className="ml-8 pl-8"> */}

            <li className="flex items-center p-2 hover:bg-[#034e7c]">
            <NavLink to="/admin/requests" className="flex items-center w-full">
              <FaWalking size={20} className="mr-2 ml-2 mb-4 mt-3" />
              <span className={`${isOpen ? 'block' : 'hidden'} ml-4`}>Leave Requests</span>
            </NavLink>
            </li>

            <li className="flex items-center p-2 hover:bg-[#034e7c]">
            <NavLink to="/admin/leave-cancel-requests" className="flex items-center w-full">
              <TbExchange size={20} className="mr-2 ml-2 mb-4 mt-3" />
              <span className={`${isOpen ? 'block' : 'hidden'} ml-4`}>Leave Requests Updates</span>
            </NavLink>
            </li>

            <li className="flex items-center p-2 hover:bg-[#034e7c]">
            <NavLink to="/admin/leave-history" className="flex items-center w-full">
              <FaHistory size={20} className="mr-2 ml-2 mb-4 mt-3" />
              <span className={`${isOpen ? 'block' : 'hidden'} ml-4`}>Leave History</span>
            </NavLink>
            </li>

            <li className="flex items-center p-2 hover:bg-[#034e7c]">
            <NavLink to="/admin/leave-plan" className="flex items-center w-full">
              <MdSpaceDashboard size={20} className="mr-2 ml-2 mb-4 mt-3" />
              <span className={`${isOpen ? 'block' : 'hidden'} ml-4`}>Dashboard</span>
            </NavLink>
            </li>

            <li className="flex items-center p-2 hover:bg-[#034e7c]">
            <NavLink to="/admin/employee-attendance" className="flex items-center w-full">
              <FaUserCheck size={20} className="mr-2 ml-2 mb-4 mt-3" />
              <span className={`${isOpen ? 'block' : 'hidden'} ml-4`}>Attendance</span>
            </NavLink>
            </li>

            <li className="flex items-center p-2 hover:bg-[#034e7c]">
            <NavLink to="/admin/attendance-update-requests" className="flex items-center w-full">
              <RxUpdate size={20} className="mr-2 ml-2 mb-4 mt-3" />
              <span className={`${isOpen ? 'block' : 'hidden'} ml-4`}>Attendance Update Requests</span>
            </NavLink>
            </li>

            <li className="flex items-center p-2 hover:bg-[#034e7c]">
            <NavLink to="/admin/manage-employee" className="flex items-center w-full">
              <MdAdminPanelSettings size={20} className="mr-2 ml-2 mb-4 mt-3" />
              <span className={`${isOpen ? 'block' : 'hidden'} ml-4`}>Manage Employee</span>
            </NavLink>
            </li>

              {/* <li className="flex items-center p-2 mt-4 hover:bg-[#034e7c]">
                <NavLink to="/admin/requests" className="w-full">Leave Requests</NavLink>
              </li> */}

              {/* <li className="flex items-center p-2 mt-4 hover:bg-[#034e7c]">
                <NavLink to="/admin/leave-cancel-requests" className="w-full">Leave Requests Updates</NavLink>
              </li> */}

              {/* <li className="flex items-center p-2 mt-4 hover:bg-[#034e7c]">
                <NavLink to="/admin/leave-history" className="w-full">Leave History</NavLink>
              </li> */}

              {/* <li className="flex items-center p-2 mt-4 hover:bg-[#034e7c]">
                <NavLink to="/admin/leave-plan" className="w-full">Leave Plan</NavLink>
              </li> */}

              {/* <li className="flex items-center p-2 mt-4 hover:bg-[#034e7c]">
                <NavLink to="/admin/employee-attendance" className="w-full">Attendance</NavLink>
              </li> */}

              {/* <li className="flex items-center p-2 mt-4 hover:bg-[#034e7c]">
                <NavLink to="/admin/attendance-update-requests" className="w-full">Attendance Update Requests</NavLink>
              </li> */}

              {/* <li className="flex items-center p-2 mt-4 hover:bg-[#034e7c]">
                <NavLink to="/admin/manage-employee" className="w-full">Manage Employee</NavLink>
              </li> */}
              </>
)}
            </ul>

           {/* )} */}
          {/* </>
        )} */}
        {/* </ul> */}
      </div>
    </div>
  );
};

export default Sidebar;
