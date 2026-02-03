const express = require('express');
const router = express.Router();
const { getUsers, createUser, updateUser, deleteUser, resetPassword } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getUsers);
router.post('/', protect, createUser);
router.put('/:id', protect, updateUser);
router.put('/:id/reset-password', protect, resetPassword);
router.delete('/:id', protect, deleteUser);

module.exports = router;
