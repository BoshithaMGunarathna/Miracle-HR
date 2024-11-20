const User = require('../models/User');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

const register = async (req, res) => {
  try {
    const { firstName, lastName,position,roleDescription, email, password, role,  phone } = req.body;
    console.log(req.body);
    if (!firstName || !email || !password || !roleDescription || !phone) {
      return res.status(400).send('Name, email, password, bio, and phone are required.');
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).send('User with this email already exists.');
    }

    // Create a new user instance
    const user = new User({ 
      firstName,
      lastName,
      position,
      roleDescription,
      email, 
      password, 
      role: role || 'employee',
      phone
     
    });

    // Save the user to the database
    await user.save();

    res.status(201).send('User registered successfully');
  } catch (error) {
    res.status(500).send(error.message);
  }
};


const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(400).send('Invalid credentials');
    }

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.status(200).json({
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        roleDescription: user.roleDescription,
        position: user.position,
        photo: user.photo,
     
      },
    });
  } catch (error) {
    res.status(500).send(error.message);
  }
};

module.exports = { register, login };
