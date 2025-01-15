const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication management
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     RegisterUser:
 *       type: object
 *       required:
 *         - name
 *         - username
 *         - password
 *         - role_id
 *         - num
 *         - email
 *         - address
 *       properties:
 *         name:
 *           type: string
 *           description: The name of the user
 *         username:
 *           type: string
 *           description: The username of the user
 *         password:
 *           type: string
 *           description: The password of the user
 *         role_id:
 *           type: integer
 *           description: The role ID of the user
 *         num:
 *           type: string
 *           description: The mobile number of the user
 *         email:
 *           type: string
 *           description: The email of the user
 *         address:
 *           type: string
 *           description: The address of the user
 *       example:
 *         name: John Doe
 *         username: johndoe
 *         password: password123
 *         role_id: 1
 *         num: '1234567890'
 *         email: johndoe@example.com
 *         address: 123 Main St, Anytown, USA
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterUser'
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Invalid input
 *       409:
 *         description: Username or mobile number already exists
 *       500:
 *         description: Internal Server Error
 */

// Register Route
router.post("/register", (req, res, next) => {
  console.log("Register route hit");
  next();
}, authController.registerUser);

/**
 * @swagger
 * components:
 *   schemas:
 *     LoginUser:
 *       type: object
 *       required:
 *         - username
 *         - password
 *       properties:
 *         username:
 *           type: string
 *           description: The username of the user
 *         password:
 *           type: string
 *           description: The password of the user
 *       example:
 *         username: johndoe
 *         password: password123
 */

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login a user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginUser'
 *     responses:
 *       200:
 *         description: User logged in successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: JWT token
 *                 id:
 *                   type: integer
 *                   description: User ID
 *       401:
 *         description: Invalid username or password
 *       500:
 *         description: Internal Server Error
 */

// Login Route
router.post("/login", authController.loginUser);

module.exports = router;