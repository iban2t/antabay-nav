const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Register Route
router.post('/auth/register', authController.registerUser);

// Login Route
router.post('/auth/login', authController.loginUser);

module.exports = router;