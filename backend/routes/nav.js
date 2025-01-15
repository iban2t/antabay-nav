const express = require('express');
const router = express.Router();
const navController = require('../controllers/navController');
const authenticateToken = require('../middleware/authenticateToken');

//Locations Table
//Create a new location
router.post('/loc/add', authenticateToken, navController.addLoc);

//Get all locations
router.get('/loc', authenticateToken, navController.allLocs);

//Get single location
router.get('/loc/:id', authenticateToken, navController.getLoc);

//Update location
router.put('/loc/:id', authenticateToken, navController.updateLoc);

//Delete location
router.delete('/loc/:id', authenticateToken, navController.deleteLoc);

//Real Location Table
//Create a new location
router.post('/realloc/add', authenticateToken, navController.addRealLoc);

//All real location
router.get('/realloc', authenticateToken, navController.allRealLocs);

//Get single location
router.get('/realloc/:id', authenticateToken, navController.getRealLoc);

//Update location
router.put('/realloc/:id', authenticateToken, navController.updateRealLoc);

//Delete location
router.delete('/realloc/:id', authenticateToken, navController.deleteRealLoc);

//Distress table
//Create a new location
router.post('/distress/add', authenticateToken, navController.addDistress);

// All real location
router.get('/distress', authenticateToken, navController.allDistress);

//Get single location
router.get('/distress/:id', authenticateToken, navController.getDistress);

//Report table
//Add report
router.post('/report/add', authenticateToken, navController.addReport);

//Get all reports
router.get('/report', authenticateToken, navController.allReports);

//Get report by id
router.get('/report/:id', authenticateToken, navController.getReport);

module.exports = router;