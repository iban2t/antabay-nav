const express = require('express');
const router = express.Router();
const zonesController = require('../controllers/zonesController');
const authenticateToken = require('../middleware/authenticateToken');

//Get all zones
router.get('/zones', authenticateToken, zonesController.allZones);

//Get zones by id
router.get('/zones/:id', authenticateToken, zonesController.getZone);

module.exports = router;