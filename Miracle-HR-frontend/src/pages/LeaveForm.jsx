import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Menue';
import Heading from '../components/Heading';

const ApplyLeave = () => {
  const [leaveType, setLeaveType] = useState('normal'); // Default set to 'normal'
  const [reason, setReason] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [statusMessage, setStatusMessage] = useState('');

  const [userData, setUserData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: ''
  });

  const getUserData = () => {
    const userDataCookie = document.cookie
      .split("; ")
      .find((row) => row.startsWith("userData="));
    return userDataCookie
      ? JSON.parse(decodeURIComponent(userDataCookie.split("=")[1]))
      : null;
  };

  useEffect(() => {
    const storedUserData  = getUserData();
    if (storedUserData ) {
      setUserData({
        firstName: storedUserData.firstName || '',
        lastName: storedUserData.lastName || '',
        phone: storedUserData.phone || '',
        email: storedUserData.email || '',
        userId : storedUserData.id || ''
      });
      console.log(userData);
    }
  }, []);
 



  // Handle radio button change
  const handleLeaveTypeChange = (event) => {
    setLeaveType(event.target.value);
  };

  // Handle form submission
  const handleSubmit = async (event) => {
    event.preventDefault();

    const leaveData = {
      ...userData,
      leaveType,
      reason: leaveType === 'normal' ? reason : '', 
      startDate,
      endDate,
    };

    try {
      const response = await fetch('http://localhost:5000/api/leave/apply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(leaveData),
      });
      console.log(leaveData);

      const data = await response.json();

      if (response.ok) {
        setStatusMessage('Leave application submitted successfully!');
        // Reset form after successful submit
        setLeaveType('normal');
        setReason('');
        setStartDate('');
        setEndDate('');
      } else {
        setStatusMessage(data.message || 'Something went wrong. Please try again.');
      }
    } catch (error) {
      setStatusMessage('Error: ' + error.message);
    }
  };

  // Get today's date to disable past dates in date picker
  const today = new Date().toISOString().split('T')[0];

  return (
    <div>
      <Navbar />
      <div className="flex">
        <Sidebar />
        <div className="flex-1 p-20">
          <Heading text="Apply for Leave" />
          <form className="mt-4" onSubmit={handleSubmit}>

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

            {/* Name Fields (No need for user to input) */}
            <div className="flex space-x-4">
              <div className="flex-1">
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">First Name</label>
                <input
                  type="text"
                  id="firstName"
                  value={userData.firstName}
                  readOnly
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                />
              </div>
              <div className="flex-1">
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">Last Name</label>
                <input
                  type="text"
                  id="lastName"
                  value={userData.lastName}
                  readOnly
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                />
              </div>
            </div>

            {/* Phone Field */}
            <div className="mt-4">
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone</label>
              <input
                type="tel"
                id="phone"
                value={userData.phone}
                readOnly
                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              />
            </div>

            {/* Email Field */}
            <div className="mt-4">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                id="email"
                value={userData.email}
                readOnly
                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              />
            </div>

            {/* Absence Dates */}
            <div className="flex space-x-4 mt-4">
              <div className="flex-1">
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">First Day of Absence</label>
                <input
                  type="date"
                  id="startDate"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                  min={today}
                />
              </div>
              <div className="flex-1">
                <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">Last Day of Absence</label>
                <input
                  type="date"
                  id="endDate"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                  min={today}
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

          {/* Status Message */}
          {statusMessage && (
            <div className="mt-4 p-2 bg-green-100 text-green-700">
              {statusMessage}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApplyLeave;
