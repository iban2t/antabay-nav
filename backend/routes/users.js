const express = require('express');
const router = express.Router();
const rolesController = require('../controllers/rolesController');
const usersController = require('../controllers/usersController');
const contactsController = require('../controllers/contactsController');
const frequentController = require('../controllers/frequentController');
const authenticateToken = require('../middleware/authenticateToken');

//Roles Table
//Add Role Route
router.post('/roles/add', authenticateToken, rolesController.addRole);

//All Role Route
router.get('/roles', authenticateToken, rolesController.getRoles);

//Single Role Route
router.get('/roles/:id', authenticateToken, rolesController.getRole);

//Update Role Route
router.put('/update/:id', authenticateToken, rolesController.updateRole);

// Delete Role Route
router.delete('/:id', authenticateToken, rolesController.deleteRole);

//Users Table
//All Users Route
router.get('/users', authenticateToken, usersController.getUsers);

// Single User Route
router.get('/users/:id', authenticateToken, usersController.getUser);

// Update User Route
router.put('/users/:id', authenticateToken, usersController.updateUser);

// Delete User Route
router.delete('/users/:id', authenticateToken, usersController.deleteUser);

//Contacts Table
//Add Contacts Route
router.post('/contacts/add', authenticateToken, contactsController.addContact);

//All Contacts Route
router.get('/contacts', authenticateToken, contactsController.getContacts);

// Single Contact Route
router.get('/contacts/:id', authenticateToken, contactsController.getContact);

// Update Contact Route
router.put('/contacts/:id', authenticateToken, contactsController.updateContact);

// Delete Contact Route
router.delete('/contacts/:id', authenticateToken, contactsController.deleteContact);

//FrequentLocation Table
//Add freqLocation Route
router.post('/freq/add', authenticateToken, frequentController.addFreq);

//Get all freqLocation Route
router.get('/freq', authenticateToken, frequentController.allFreq);

//Get freqLocation Route
router.get('/freq/:id', authenticateToken, frequentController.getFreq);

//Update freqLocation Route
router.put('/freq/:id', authenticateToken, frequentController.updateFreq);

//Delete freqLocation Route
router.delete('/freq/:id', authenticateToken, frequentController.deleteFreq);

module.exports = router;