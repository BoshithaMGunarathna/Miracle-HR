const Leave = require('../models/Leave');

// Create a new leave application
const createLeaveApplication = async (req, res) => {
  try {
    const { firstName, lastName, phone, email, leaveType, reason, startDate, endDate,userId  } = req.body;

    // Create a new leave application
    const newLeave = new Leave({
      firstName,
      lastName,
      phone,
      email,
      leaveType,
      reason,
      startDate,
      endDate,
      userId
    });

    // Save the leave application to the database
    await newLeave.save();
    res.status(201).json({ message: 'Leave application submitted successfully', data: newLeave });
  } catch (err) {
    res.status(500).json({ message: 'Error submitting leave application', error: err.message });
  }
};

// Get all leave applications
const getAllLeaveApplications = async (req, res) => {
  try {
    const leaves = await Leave.find();
    res.status(200).json({ data: leaves });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching leave applications', error: err.message });
  }
};

// Get a specific leave application by ID
const getLeaveById = async (req, res) => {
  try {
    const leave = await Leave.findById(req.params.id);
    if (!leave) {
      return res.status(404).json({ message: 'Leave application not found' });
    }
    res.status(200).json({ data: leave });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching leave application', error: err.message });
  }
};

// Update a leave application (e.g., change status)
const updateLeaveStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const leave = await Leave.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!leave) {
      return res.status(404).json({ message: 'Leave application not found' });
    }
    res.status(200).json({ message: 'Leave status updated successfully', data: leave });
  } catch (err) {
    res.status(500).json({ message: 'Error updating leave status', error: err.message });
  }
};

const getLeaveApplicationsByUserId = async (req, res) => {
  try {
    // Get the userId from the URL parameter
    const { userId } = req.params;

    // Fetch all leave applications associated with the userId
    const leaveApplications = await Leave.find({ userId });

    // If no leave applications are found
    if (!leaveApplications || leaveApplications.length === 0) {
      return res.status(404).json({ message: 'No leave applications found for this user.' });
    }

    // Return the leave applications
    res.status(200).json({ message: 'Leave applications retrieved successfully', data: leaveApplications });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching leave applications', error: err.message });
  }
};


module.exports = { createLeaveApplication, getAllLeaveApplications, getLeaveById, updateLeaveStatus, getLeaveApplicationsByUserId };
