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

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: Users management
 */

/**
 * @swagger
 * /users/users:
 *   get:
 *     summary: Get all users
 *     tags: [Users]
 *     security:
 *       - customTokenAuth: []
 *     responses:
 *       200:
 *         description: List of all users
 *       500:
 *         description: Internal Server Error
 */
router.get('/users', authenticateToken, usersController.getUsers);

/**
 * @swagger
 * /users/users/{id}:
 *   get:
 *     summary: Get a single user by ID
 *     tags: [Users]
 *     security:
 *       - customTokenAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: User ID
 *     responses:
 *       200:
 *         description: User details
 *       400:
 *         description: Please provide user_id
 *       404:
 *         description: Account does not exist
 *       500:
 *         description: Internal Server Error
 */
router.get('/users/:id', authenticateToken, usersController.getUser);

/**
 * @swagger
 * /users/users/{id}:
 *   put:
 *     summary: Update a user by ID
 *     tags: [Users]
 *     security:
 *       - customTokenAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - username
 *               - password
 *               - role_id
 *               - num
 *               - email
 *             properties:
 *               name:
 *                 type: string
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *               role_id:
 *                 type: integer
 *               num:
 *                 type: string
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: User updated successfully
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Account does not exist
 *       500:
 *         description: Internal Server Error
 */
router.put('/users/:id', authenticateToken, usersController.updateUser);

/**
 * @swagger
 * /users/users/{id}:
 *   delete:
 *     summary: Delete a user by ID
 *     tags: [Users]
 *     security:
 *       - customTokenAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: User ID
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       400:
 *         description: Please provide user_id
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal Server Error
 */
router.delete('/users/:id', authenticateToken, usersController.deleteUser);


/**
 * @swagger
 * tags:
 *   name: Contacts
 *   description: Contacts management
 */

/**
 * @swagger
 * /users/contacts/add:
 *   post:
 *     summary: Add a new contact
 *     tags: [Contacts]
 *     security:
 *       - customTokenAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - type
 *               - num
 *               - username
 *             properties:
 *               name:
 *                 type: string
 *               type:
 *                 type: string
 *               num:
 *                 type: string
 *               username:
 *                 type: string
 *     responses:
 *       201:
 *         description: Contact added successfully
 *       500:
 *         description: Internal Server Error
 */
router.post('/contacts/add', authenticateToken, contactsController.addContact);

/**
 * @swagger
 * /users/contacts:
 *   get:
 *     summary: Get all contacts
 *     tags: [Contacts]
 *     security:
 *       - customTokenAuth: []
 *     responses:
 *       200:
 *         description: List of all contacts
 *       500:
 *         description: Internal Server Error
 */
router.get('/contacts', authenticateToken, contactsController.getContacts);

/**
 * @swagger
 * /users/contacts/{id}:
 *   get:
 *     summary: Get a single contact by ID
 *     tags: [Contacts]
 *     security:
 *       - customTokenAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Contact ID
 *     responses:
 *       200:
 *         description: Contact details
 *       404:
 *         description: Contact not found
 *       500:
 *         description: Internal Server Error
 */
router.get('/contacts/:id', authenticateToken, contactsController.getContact);

/**
 * @swagger
 * /users/contacts/{id}:
 *   put:
 *     summary: Update a contact by ID
 *     tags: [Contacts]
 *     security:
 *       - customTokenAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Contact ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - type
 *               - num
 *               - username
 *             properties:
 *               name:
 *                 type: string
 *               type:
 *                 type: string
 *               num:
 *                 type: string
 *               username:
 *                 type: string
 *     responses:
 *       200:
 *         description: Contact updated successfully
 *       404:
 *         description: Contact not found or unauthorized
 *       500:
 *         description: Internal Server Error
 */
router.put('/contacts/:id', authenticateToken, contactsController.updateContact);

/**
 * @swagger
 * /users/contacts/{id}:
 *   delete:
 *     summary: Delete a contact by ID
 *     tags: [Contacts]
 *     security:
 *       - customTokenAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Contact ID
 *     responses:
 *       200:
 *         description: Contact deleted successfully
 *       404:
 *         description: Contact not found or unauthorized
 *       500:
 *         description: Internal Server Error
 */
router.delete('/contacts/:id', authenticateToken, contactsController.deleteContact);

/**
 * @swagger
 * tags:
 *   name: FrequentLocations
 *   description: Frequent Locations management
 */

/**
 * @swagger
 * /users/freq/add:
 *   post:
 *     summary: Add a new frequent location
 *     tags: [FrequentLocations]
 *     security:
 *       - customTokenAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - category
 *               - name
 *               - address
 *               - loc_id
 *             properties:
 *               category:
 *                 type: string
 *               name:
 *                 type: string
 *               address:
 *                 type: string
 *               loc_id:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Frequent location added successfully
 *       500:
 *         description: Internal Server Error
 */
router.post('/freq/add', authenticateToken, frequentController.addFreq);

/**
 * @swagger
 * /users/freq:
 *   get:
 *     summary: Get all frequent locations
 *     tags: [FrequentLocations]
 *     security:
 *       - customTokenAuth: []
 *     responses:
 *       200:
 *         description: List of all frequent locations
 *       500:
 *         description: Internal Server Error
 */
router.get('/freq', authenticateToken, frequentController.allFreq);

/**
 * @swagger
 * /users/freq/{id}:
 *   get:
 *     summary: Get a single frequent location by ID
 *     tags: [FrequentLocations]
 *     security:
 *       - customTokenAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Frequent location ID
 *     responses:
 *       200:
 *         description: Frequent location details
 *       404:
 *         description: Frequent location not found
 *       500:
 *         description: Internal Server Error
 */
router.get('/freq/:id', authenticateToken, frequentController.getFreq);

/**
 * @swagger
 * /users/freq/{id}:
 *   put:
 *     summary: Update a frequent location by ID
 *     tags: [FrequentLocations]
 *     security:
 *       - customTokenAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Frequent location ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - category
 *               - name
 *               - address
 *               - loc_id
 *             properties:
 *               category:
 *                 type: string
 *               name:
 *                 type: string
 *               address:
 *                 type: string
 *               loc_id:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Frequent location updated successfully
 *       404:
 *         description: Frequent location not found or unauthorized
 *       500:
 *         description: Internal Server Error
 */
router.put('/freq/:id', authenticateToken, frequentController.updateFreq);

/**
 * @swagger
 * /users/freq/{id}:
 *   delete:
 *     summary: Delete a frequent location by ID
 *     tags: [FrequentLocations]
 *     security:
 *       - customTokenAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Frequent location ID
 *     responses:
 *       200:
 *         description: Frequent location deleted successfully
 *       404:
 *         description: Frequent location not found or unauthorized
 *       500:
 *         description: Internal Server Error
 */
router.delete('/freq/:id', authenticateToken, frequentController.deleteFreq);

module.exports = router;