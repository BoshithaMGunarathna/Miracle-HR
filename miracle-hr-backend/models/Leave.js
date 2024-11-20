const mongoose = require('mongoose');

const leaveSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true },
  leaveType: { 
    type: String, 
    enum: ['normal', 'half', 'short'], 
    required: true 
  },
  reason: { 
    type: String, 
    required: function() {
      return this.leaveType === 'normal'; // Makes reason required only for normal leave
    },
    validate: {
      validator: function(value) {
        // Reason is required only if leaveType is 'normal'
        return this.leaveType !== 'normal' || value != null && value.trim() !== '';
      },
      message: 'Reason is required for normal leave.'
    }
  },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  }
});

const Leave = mongoose.model('Leave', leaveSchema);

module.exports = Leave;
