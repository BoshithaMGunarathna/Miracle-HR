const express = require('express');
const { createLeaveApplication, getAllLeaveApplications, getLeaveById, updateLeaveStatus, getLeaveApplicationsByUserId } = require('../controllers/leaveController');
const router = express.Router();

// Route to create a leave application
router.post('/apply', createLeaveApplication);

// Route to get all leave applications (Admin)
router.get('/', getAllLeaveApplications);
router.get('/user/:userId', getLeaveApplicationsByUserId);


// Route to get a leave application by ID (Admin)
router.get('/:id', getLeaveById);

// Route to update the status of a leave application (Admin)
router.put('/:id/status', updateLeaveStatus);

module.exports = router;
