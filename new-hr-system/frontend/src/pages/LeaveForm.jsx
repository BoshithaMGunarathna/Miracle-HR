import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Menue';
import Heading from '../components/Heading';
import { useLocation } from 'react-router-dom';
import SimpleAlert from '../components/Alert';
import LeaveCount from '../components/LCount';
import axiosClient from '../../axios-client';

const ApplyLeave = () => {
  const location = useLocation();
  const { updatedRowData } = location.state || {};
  const [daysCount, setDaysCount] = useState(0);
  const [leaveType, setLeaveType] = useState('normal');
  const [reason, setReason] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [representative, setRepresentative] = useState('');
  const [representatives, setRepresentatives] = useState([]);  // State to hold employee names

  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertSeverity, setAlertSeverity] = useState('');

  // Error states
  const [reasonError, setReasonError] = useState("");
  const [startDateError, setStartDateError] = useState("");
  const [endDateError, setEndDateError] = useState("");
  const [representativeError, setRepresentativeError] = useState("");

  // States for leave counts
  const [annualLeaveCount, setAnnualLeaveCount] = useState(null);
  const [casualLeaveCount, setCasualLeaveCount] = useState(null);
  const [annualLeaveTaken, setAnnualLeaveTaken] = useState(0);
  const [casualLeaveTaken, setCasualLeaveTaken] = useState(0);
  const [nopayLeaveTaken, setNopayLeaveTaken] = useState(0);

  const emp_id = localStorage.getItem("emp_id");

  console.log('Received data:', {

    updatedRowData
  });
  // const navigate = useNavigate();

  // Function to calculate days difference
  const calculateDaysDifference = (start, end) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    console.log('SD', startDate)
    console.log('ED', endDate)
    const timeDiff = endDate.getTime() - startDate.getTime();
    const daysDiff = timeDiff / (1000 * 3600 * 24); // Convert milliseconds to days

    return daysDiff + 1; // Include the first day in the count
  };

  useEffect(() => {
    // Fetch leave count data and representatives list
    axiosClient.get(`/leave/${emp_id}`)
      .then(response => {
        if (response.data.status === "success") {
          const employees = response.data.data.employees; // Assuming this is an array of employee objects
          const leave = response.data.data.additionalData;
          console.log('Fetched Data:', leave);

          // Define currentEmployee outside the loop
          let currentEmployee = null;

          // Find the current employee
          for (let i = 0; i < leave.length; i++) {

            if (leave[i].emp_id === emp_id) {

              currentEmployee = leave[i]; // Set currentEmployee here

              break; // Exit loop once employee is found
            }
          }

          setAnnualLeaveCount(leave[0].annual_leave_count);
          setCasualLeaveCount(leave[0].cassual_leave_count);
          setAnnualLeaveTaken(leave[0].annual_leave_taken);
          setCasualLeaveTaken(leave[0].cassual_leave_taken);
          setNopayLeaveTaken(leave[0].nopay_leave_taken)

          setRepresentatives(employees);

          if (updatedRowData?.representative) {
            const matchedRepresentative = employees.find(
              (rep) => `${rep.f_name} ${rep.l_name}` === updatedRowData.representative
            );
            if (matchedRepresentative) {
              setRepresentative(matchedRepresentative.emp_id);
              console.log('Representative', matchedRepresentative.emp_id)
            }
          }

          // Check and set the reason
          if (updatedRowData?.reason) {
            // setReason(updatedRowData.reason);
            if (updatedRowData.reason === 'Annual Leave') {
              setReason('annual');

            }
            if (updatedRowData.reason === 'Casual Leave') {
              setReason('casual');

            }
            if (updatedRowData.reason === 'No Pay Leave') {
              setReason('nopay');

            }
          }

          if (updatedRowData?.first_day) {
            setStartDate(updatedRowData.first_day);

          }
          if (updatedRowData?.last_day) {
            setEndDate(updatedRowData.last_day);

          }

          if (updatedRowData?.leave_type) {

            if (updatedRowData.leave_type === 'Normal Leave') {
              setLeaveType('normal');

            }
            if (updatedRowData.leave_type === 'Short Leave') {
              setLeaveType('short');

            }
            if (updatedRowData.leave_type === 'Half Day') {
              setLeaveType('half');

            }
            // setLeaveType(updatedRowData.leave_type);

          }
        } else {
          console.error("Failed to fetch leave count and representatives:", response.data.message);
        }
      })
      .catch(error => {
        console.error("There was an error fetching leave count data:", error);
      });
  }, [emp_id]);


  const handleSubmit = (e) => {
    e.preventDefault();
    setReasonError("");
    setStartDateError("");
    setEndDateError("");
    setRepresentativeError("");

    let isValid = true;

    // Validation
    if (leaveType === 'normal' && !reason) {
      setReasonError("Reason is required.");
      isValid = false;
    }
    if (!startDate) {
      setStartDateError("Start date is required.");
      isValid = false;
    }
    if (!endDate) {
      setEndDateError("End date is required.");
      isValid = false;
    } else if (new Date(endDate) < new Date(startDate)) {
      setEndDateError("End date cannot be earlier than start date.");
      isValid = false;
    }
    if (!representative) {
      setRepresentativeError("Representative is required.");
      isValid = false;
    }
    if (startDate && endDate) {
      const days = calculateDaysDifference(startDate, endDate);
      console.log('Start Day', startDate)
      console.log('End Day', endDate)
      console.log('Days', days)
      setDaysCount(days); // Set the days count
      console.log('difffff', daysCount)
      console.log('casualLeaveTaken', casualLeaveTaken)
      console.log('annualLeaveTaken', annualLeaveTaken)

      if (reason === 'annual') {
        if (annualLeaveCount !== null && (annualLeaveTaken + days) > annualLeaveCount) {
          console.log('total a l ', annualLeaveTaken + days)

          setAlertMessage("Sorry! You Don't Have Enough Annual Leaves Available");
          setAlertSeverity('error');
          setShowAlert(true);
          setTimeout(() => {
            setShowAlert(false);
          }, 5000);

          isValid = false;
        }
      }

      if (reason === 'casual') {
        if (casualLeaveCount !== null && (casualLeaveTaken + days) > casualLeaveCount) {
          console.log('total c l ', casualLeaveTaken + days)

          setAlertMessage("Sorry! You Don't Have Enough Casual Leaves Available");
          setAlertSeverity('error');
          setShowAlert(true);
          setTimeout(() => {
            setShowAlert(false);
          }, 5000);

          isValid = false;
        }
      }
    }


    if (isValid) {
      const emp_id = localStorage.getItem("emp_id");

      // Find the selected representative and combine f_name and l_name into one string
      const selectedRepresentative = representatives.find(
        (rep) => rep.emp_id === parseInt(representative)
      );

      const representativeName = selectedRepresentative
        ? `${selectedRepresentative.f_name} ${selectedRepresentative.l_name}`
        : "";

      const formData = {
        emp_id,
        leaveType,
        reason,
        startDate,
        endDate,
        representative: representativeName,  // Send as one concatenated name
      };

      if (updatedRowData) {


        if (updatedRowData.leave_id) {
          formData.leave_id = updatedRowData.leave_id;
          formData.old_first_day = updatedRowData.first_day;
          formData.old_last_day = updatedRowData.last_day;
          formData.old_representative = updatedRowData.representative;
          formData.old_reason = updatedRowData.reason;
          formData.old_leave_type = updatedRowData.leave_type;
          formData.action = updatedRowData.action;

          console.log('form data', formData)
          axiosClient.post("/update-leave", formData)
            .then(response => {
              if (response.data.status === "success") {

                setAlertMessage("Leave Update Application Submitted Successfully!");
                setAlertSeverity('success');
                setShowAlert(true);
                setTimeout(() => {
                  setShowAlert(false);
                }, 5000);

                // Navigate to requests page
              } else {

                setAlertMessage(response.data.message);
                setAlertSeverity('error');
                setShowAlert(true);
                setTimeout(() => {
                  setShowAlert(false);
                }, 5000);
              }
            })
            .catch(error => {
              console.error("There was an error with the submission:", error);

              setAlertMessage("Leave Update Submission Failed. Please Try Again.");
              setAlertSeverity('error');
              setShowAlert(true);
              setTimeout(() => {
                setShowAlert(false);
              }, 5000);

            });
        }
        if (updatedRowData.leave_request_id) {
          formData.leave_request_id = updatedRowData.leave_request_id;
          // formData.old_first_day = updatedRowData.first_day;
          // formData.old_last_day = updatedRowData.last_day;
          // formData.old_representative = updatedRowData.representative;
          // formData.old_reason = updatedRowData.reason;
          // formData.old_leave_type = updatedRowData.leave_type;

          axiosClient.put(`/update-leave/${updatedRowData.leave_request_id}`, formData)
            .then(response => {
              if (response.data.status === "success") {

                setAlertMessage("Leave Updated Successfully!");
                setAlertSeverity('success');
                setShowAlert(true);
                setTimeout(() => {
                  setShowAlert(false);
                }, 5000);

                // Navigate to requests page
              } else {

                setAlertMessage(response.data.message);
                setAlertSeverity('error');
                setShowAlert(true);
                setTimeout(() => {
                  setShowAlert(false);
                }, 5000);
              }
            })
            .catch(error => {
              console.error("There was an error with the submission:", error);

              setAlertMessage("Leave Update Failed!");
              setAlertSeverity('error');
              setShowAlert(true);
              setTimeout(() => {
                setShowAlert(false);
              }, 5000);
            });

        }
      } else {
        axiosClient.post("/leave", formData)
          .then(response => {
            if (response.data.status === "success") {

              setAlertMessage("Leave Request Submitted Successfully!");
              setAlertSeverity('success');
              setShowAlert(true);
              setTimeout(() => {
                setShowAlert(false);
              }, 5000);

              // Navigate to requests page
            } else {

              setAlertMessage(response.data.message);
              setAlertSeverity('error');
              setShowAlert(true);
              setTimeout(() => {
                setShowAlert(false);
              }, 5000);
            }
          })
          .catch(error => {
            console.error("There was an error with the submission:", error);


            setAlertMessage("Leave Submission Failed. Please Try Again");
            setAlertSeverity('error');
            setShowAlert(true);
            setTimeout(() => {
              setShowAlert(false);
            }, 5000);
          });
      }


    }
  };

  // Handle change for start date to synchronize with end date for short/half day
  const handleDateChange = (e) => {
    const { id, value } = e.target;
    if (id === "startDate" || id === "endDate") {
      if (leaveType === 'half' || leaveType === 'short') {
        // Ensure both start and end dates are the same for half day or short leave
        setStartDate(value);
        setEndDate(value);
      } else {
        // For normal leave, set dates individually
        if (id === "startDate") setStartDate(value);
        if (id === "endDate") setEndDate(value);
      }


    }


  };
  useEffect(() => {
    const days = calculateDaysDifference(startDate, endDate);
    setDaysCount(days);
  }, [startDate, endDate]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex flex-grow h-full">
        <Sidebar className="h-full min-h-full" />
        <div className="flex-1 p-20">
          <div className="flex-1 mb-5 ">
            <div className={`flex-1 mb-5 ${showAlert ? "fixed top-0 left-0 w-full z-50" : ""}`}>
              {showAlert && (
                <SimpleAlert severity={alertSeverity} message={alertMessage} />
              )}
            </div>
          </div>


          <div className="flex flex-row justify-between space-x-4 mt-4">
            <Heading text="Apply for Leave" />

            <div className="flex flex-row justify-center space-x-4 mt-4 mb-8">
              <LeaveCount
                label="Annual Leaves Remaining"
                count={annualLeaveCount - annualLeaveTaken}
              />

              <LeaveCount
                label="Casual Leaves Remaining"
                count={casualLeaveCount - casualLeaveTaken}
              />

              <LeaveCount
                label="No of Other Leaves Taken"
                count={nopayLeaveTaken}
              />

            </div>





          </div>
          <form className="mt-4 " onSubmit={handleSubmit}>
            <fieldset className="mt-10 mb-10">

              <div className="flex space-x-16">

                <div className="flex items-center">
                  <input
                    type="radio"
                    id="normalLeave"
                    name="leaveType"
                    value="normal"
                    checked={leaveType === 'normal'}
                    onChange={(e) => setLeaveType(e.target.value)}
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
                    onChange={(e) => setLeaveType(e.target.value)}
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
                    onChange={(e) => setLeaveType(e.target.value)}
                    className="mr-2"
                  />
                  <label htmlFor="shortLeave" className="text-sm">Short Leave</label>
                </div>
              </div>
            </fieldset>


            <div className="flex space-x-4 mt-4">

              <div className="flex-1">
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">First Day of Absence</label>
                <input
                  type="date"
                  id="startDate"
                  value={startDate}
                  onChange={handleDateChange}
                  min={new Date().toISOString().split("T")[0]}
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                />
                {startDateError && <p className="text-red-500 text-sm mt-1">{startDateError}</p>}
              </div>

              <div className="flex-1">
                <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">Last Day of Absence</label>
                <input
                  type="date"
                  id="endDate"
                  value={endDate}
                  onChange={handleDateChange}
                  min={startDate || new Date().toISOString().split("T")[0]}
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                />
                {endDateError && <p className="text-red-500 text-sm mt-1">{endDateError}</p>}
              </div>

            </div>

            <div className="mt-4">
              <div className="mb-4">
                {daysCount > 0 ? (
                  <p className="block text-sm font-medium text-blue-700 ">Number of days selected: {daysCount}</p>
                ) : (
                  <p className="block text-sm font-medium text-orange-600">Please select valid dates.</p>
                )}
              </div>
              <label htmlFor="representative" className="block text-sm font-medium text-gray-700">Select a Person to Represent You</label>
              <select
                id="representative"
                value={representative}
                onChange={(e) => setRepresentative(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              >
                <option value="">Select a person</option>
                {representatives.map((rep) => (
                  <option key={rep.emp_id} value={rep.emp_id}>{rep.f_name} {rep.l_name}</option>

                ))}
              </select>
              {representativeError && <p className="text-red-500 text-sm mt-1">{representativeError}</p>}
            </div>

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
                  <option
                    value="annual"
                    disabled={
                      !annualLeaveCount ||
                      annualLeaveCount <= annualLeaveTaken ||
                      annualLeaveCount === null
                    }
                  >
                    Annual Leave
                  </option>
                  <option
                    value="casual"
                    disabled={
                      !casualLeaveCount ||
                      casualLeaveCount <= casualLeaveTaken ||
                      casualLeaveCount === null
                    }
                  >
                    Casual Leave
                  </option>

                  {(!annualLeaveCount || annualLeaveCount <= annualLeaveTaken || annualLeaveCount === null) &&
                    (!casualLeaveCount || casualLeaveCount <= casualLeaveTaken || casualLeaveCount === null) && (
                      <option value="nopay">Other</option>
                    )}

                  {/* <option value="nopay">No Pay Leave</option> */}
                </select>
                {reasonError && <p className="text-red-500 text-sm mt-1">{reasonError}</p>}
              </div>
            )}
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
