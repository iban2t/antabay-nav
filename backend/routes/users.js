const express = require('express');
const router = express.Router();
const rolesController = require('../controllers/rolesController');
const usersController = require('../controllers/usersController');
const contactsController = require('../controllers/contactsController');
const frequentController = require('../controllers/frequentController');
const authenticateToken = require('../middleware/authenticateToken');

/**
 * @swagger
 * tags:
 *   name: Roles
 *   description: Roles management
 */

/**
 * @swagger
 * /users/roles/add:
 *   post:
 *     summary: Add a new role
 *     tags: [Roles]
 *     security:
 *       - customTokenAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - role_code
 *               - role_name
 *             properties:
 *               role_code:
 *                 type: string
 *               role_name:
 *                 type: string
 *     responses:
 *       201:
 *         description: Role added successfully
 *       400:
 *         description: Invalid input
 *       409:
 *         description: Role already exists
 *       500:
 *         description: Internal Server Error
 */
router.post('/roles/add', authenticateToken, rolesController.addRole);

/**
 * @swagger
 * /users/roles:
 *   get:
 *     summary: Get all roles
 *     tags: [Roles]
 *     security:
 *       - customTokenAuth: []
 *     responses:
 *       200:
 *         description: List of all roles
 *       500:
 *         description: Internal Server Error
 */
router.get('/roles', authenticateToken, rolesController.getRoles);

/**
 * @swagger
 * /users/roles/{id}:
 *   get:
 *     summary: Get a single role by ID
 *     tags: [Roles]
 *     security:
 *       - customTokenAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Role ID
 *     responses:
 *       200:
 *         description: Role details
 *       400:
 *         description: Please provide role_id
 *       404:
 *         description: Role does not exist
 *       500:
 *         description: Internal Server Error
 */
router.get('/roles/:id', authenticateToken, rolesController.getRole);

/**
 * @swagger
 * /users/roles/update/{id}:
 *   put:
 *     summary: Update a role by ID
 *     tags: [Roles]
 *     security:
 *       - customTokenAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Role ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - role_code
 *               - role_name
 *             properties:
 *               role_code:
 *                 type: string
 *               role_name:
 *                 type: string
 *     responses:
 *       200:
 *         description: Role updated successfully
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Role does not exist
 *       500:
 *         description: Internal Server Error
 */
router.put('/roles/update/:id', authenticateToken, rolesController.updateRole);

/**
 * @swagger
 * /users/roles/{id}:
 *   delete:
 *     summary: Delete a role by ID
 *     tags: [Roles]
 *     security:
 *       - customTokenAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Role ID
 *     responses:
 *       200:
 *         description: Role deleted successfully
 *       400:
 *         description: Please provide role_id
 *       404:
 *         description: Role not found
 *       500:
 *         description: Internal Server Error
 */
router.delete('/roles/:id', authenticateToken, rolesController.deleteRole);

// Users Table
// All Users Route
router.get('/users', authenticateToken, usersController.getUsers);

// Single User Route
router.get('/users/:id', authenticateToken, usersController.getUser);

// Update User Route
router.put('/users/:id', authenticateToken, usersController.updateUser);

// Delete User Route
router.delete('/users/:id', authenticateToken, usersController.deleteUser);

// Contacts Table
// Add Contacts Route
router.post('/contacts/add', authenticateToken, contactsController.addContact);

// All Contacts Route
router.get('/contacts', authenticateToken, contactsController.getContacts);

// Single Contact Route
router.get('/contacts/:id', authenticateToken, contactsController.getContact);

// Update Contact Route
router.put('/contacts/:id', authenticateToken, contactsController.updateContact);

// Delete Contact Route
router.delete('/contacts/:id', authenticateToken, contactsController.deleteContact);

// FrequentLocation Table
// Add freqLocation Route
router.post('/freq/add', authenticateToken, frequentController.addFreq);

// Get all freqLocation Route
router.get('/freq', authenticateToken, frequentController.allFreq);

// Get freqLocation Route
router.get('/freq/:id', authenticateToken, frequentController.getFreq);

// Update freqLocation Route
router.put('/freq/:id', authenticateToken, frequentController.updateFreq);

// Delete freqLocation Route
router.delete('/freq/:id', authenticateToken, frequentController.deleteFreq);

module.exports = router;