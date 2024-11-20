const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  // name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  position: { type: String, required: true },
  password: { type: String, required: true },
  roleDescription: { type: String, required: true },
  phone: { type: String, required: true }, 
  // photo: { type: String, required: true }, 
  role: { type: String, enum: ['employee', 'admin'], default: 'employee' },
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = function (password) {
  return bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('users', userSchema);
