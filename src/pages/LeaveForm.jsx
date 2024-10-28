import React, { useState } from 'react';
import Navbar from '../components/Navbar'; // Adjust the import path according to your file structure
import Sidebar from '../components/Menue'; // Adjust the import path according to your file structure
import Heading from '../components/Heading'; // Import the Heading component

const ApplyLeave = () => {
  const [leaveType, setLeaveType] = useState('normal'); // Default set to 'normal'
  const [reason, setReason] = useState('');

  // Handle radio button change
  const handleLeaveTypeChange = (event) => {
    setLeaveType(event.target.value);
  };

  return (
    <div>
      <Navbar /> {/* Navbar is outside the flex container to take up full width */}
      <div className="flex">
        <Sidebar /> {/* Sidebar placed after the Navbar */}
        <div className="flex-1 p-20">
          <Heading text="Apply for Leave" /> {/* Use the Heading component here */}
          <form className="mt-4">

            {/* Radio Buttons for Leave Type */}
            <fieldset className="mt-10 mb-10">
              <div className="flex space-x-16">
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="normalLeave"
                    name="leaveType"
                    value="normal"
                    checked={leaveType === 'normal'}
                    onChange={handleLeaveTypeChange}
                    className="mr-2"
                  />
                  <label htmlFor="normalLeave" className="text-sm">Normal Leave</label>
                </div>
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="halfDay"
                    name="leaveType"
                    value="half"
                    checked={leaveType === 'half'}
                    onChange={handleLeaveTypeChange}
                    className="mr-2"
                  />
                  <label htmlFor="halfDay" className="text-sm">Half Day</label>
                </div>
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="shortLeave"
                    name="leaveType"
                    value="short"
                    checked={leaveType === 'short'}
                    onChange={handleLeaveTypeChange}
                    className="mr-2"
                  />
                  <label htmlFor="shortLeave" className="text-sm">Short Leave</label>
                </div>
              </div>
            </fieldset>

            {/* Name Fields */}
            <div className="flex space-x-4">
              <div className="flex-1">
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">First Name</label>
                <input
                  type="text"
                  id="firstName"
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                  placeholder="First Name"
                />
              </div>
              <div className="flex-1">
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">Last Name</label>
                <input
                  type="text"
                  id="lastName"
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                  placeholder="Last Name"
                />
              </div>
            </div>

            {/* Phone Field */}
            <div className="mt-4">
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone</label>
              <input
                type="tel"
                id="phone"
                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                placeholder="Phone Number"
              />
            </div>

            {/* Email Field */}
            <div className="mt-4">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                id="email"
                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                placeholder="Email"
              />
            </div>

            {/* Absence Dates */}
            <div className="flex space-x-4 mt-4">
              <div className="flex-1">
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">First Day of Absence</label>
                <input
                  type="date"
                  id="startDate"
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                />
              </div>
              <div className="flex-1">
                <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">Last Day of Absence</label>
                <input
                  type="date"
                  id="endDate"
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                />
              </div>
            </div>

            {/* Reason for Leave */}
            {leaveType === 'normal' && (
              <div className="mt-4">
                <label htmlFor="reason" className="block text-sm font-medium text-gray-700">Reason for Leave</label>
                <select
                  id="reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                >
                  <option value="">Select a reason</option>
                  <option value="personal">Annual Leave</option>
                  <option value="medical">Casual Leave</option>
                  <option value="vacation">Medical</option>
                  <option value="other">No Pay Leave</option>
                </select>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                className="mt-11 bg-[#00A8CE] text-white py-2 px-4 rounded-md hover:bg-[#008CBA] focus:outline-none"
              >
                Submit Leave Application
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
};

export default ApplyLeave;
