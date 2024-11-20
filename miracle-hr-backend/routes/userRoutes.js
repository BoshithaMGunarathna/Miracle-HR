const express = require('express');
const {
    
    getAllUsers,
    getUserProfile,
    updateUserProfile,
    deleteUser
    
  } = require('../controllers/userController');
const authenticateToken = require('../middleware/auth');

const router = express.Router();


router.get('/',getAllUsers);
router.get('/:id',  getUserProfile);
router.put('/:id',  updateUserProfile);
router.delete('/:id', authenticateToken, deleteUser);


module.exports = router;
