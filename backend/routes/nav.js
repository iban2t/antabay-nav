const express = require("express");
const router = express.Router();
const navController = require("../controllers/navController");
const authenticateToken = require("../middleware/authenticateToken");

/**
 * @swagger
 * tags:
 *   name: Distress
 *   description: Distress management
 */

/**
 * @swagger
 * tags:
 *   name: Locations
 *   description: Locations management
 */


/**
 * @swagger
 * tags:
 *   name: RealLocations
 *   description: RealLocations management
 */

/**
 * @swagger
 * tags:
 *   name: Reports
 *   description: Reports management
 */

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     customTokenAuth:
 *       type: apiKey
 *       in: header
 *       name: Authorization
 *       description: Custom token based authentication
 *   schemas:
 *     Location:
 *       type: object
 *       required:
 *         - name
 *         - latitude
 *         - longitude
 *       properties:
 *         name:
 *           type: string
 *           description: The name of the location
 *         latitude:
 *           type: number
 *           description: The latitude of the location
 *         longitude:
 *           type: number
 *           description: The longitude of the location
 *       example:
 *         name: Central Park
 *         latitude: 40.785091
 *         longitude: -73.968285
 *     RealLocation:
 *       type: object
 *       required:
 *         - loc_id
 *         - latitude
 *         - longitude
 *       properties:
 *         loc_id:
 *           type: integer
 *           description: The ID of the location
 *         latitude:
 *           type: number
 *           description: The latitude of the real location
 *         longitude:
 *           type: number
 *           description: The longitude of the real location
 *       example:
 *         loc_id: 1
 *         latitude: 40.6892
 *         longitude: -74.0445
 *     Distress:
 *       type: object
 *       required:
 *         - type
 *         - real_id
 *         - contact_ids
 *       properties:
 *         type:
 *           type: string
 *           description: The type of distress
 *         real_id:
 *           type: integer
 *           description: The ID of the real location
 *         contact_ids:
 *           type: array
 *           items:
 *             type: integer
 *           description: The IDs of the contacts
 *       example:
 *         type: "Emergency"
 *         real_id: 1
 *         contact_ids: [1, 2, 3]
 *     Report:
 *       type: object
 *       required:
 *         - type
 *         - user_report
 *         - address
 *         - loc_id
 *       properties:
 *         type:
 *           type: string
 *           description: The type of the report
 *         user_report:
 *           type: string
 *           description: The user's report
 *         address:
 *           type: string
 *           description: The address of the report
 *         loc_id:
 *           type: integer
 *           description: The ID of the location
 *       example:
 *         type: "Incident"
 *         user_report: "Details of the incident..."
 *         address: "123 Main St, Anytown, USA"
 *         loc_id: 1
 */

/**
 * @swagger
 * /nav/loc/add:
 *   post:
 *     summary: Create a new location
 *     tags: [Locations]
 *     security:
 *       - customTokenAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Location'
 *     responses:
 *       201:
 *         description: Location created successfully
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Internal Server Error
 */
router.post("/loc/add", authenticateToken, navController.addLoc);

/**
 * @swagger
 * /nav/loc:
 *   get:
 *     summary: Get all locations
 *     tags: [Locations]
 *     security:
 *       - customTokenAuth: []
 *     responses:
 *       200:
 *         description: A list of locations
 *       500:
 *         description: Internal Server Error
 */
router.get("/loc", authenticateToken, (req, res, next) => {
     console.log("GET /loc route hit");
     next();
   }, navController.allLocs);

/**
 * @swagger
 * /nav/loc/{id}:
 *   get:
 *     summary: Get a single location
 *     tags: [Locations]
 *     security:
 *       - customTokenAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The ID of the location
 *     responses:
 *       200:
 *         description: A single location
 *       404:
 *         description: Location not found
 *       500:
 *         description: Internal Server Error
 */
router.get("/loc/:id", authenticateToken, navController.getLoc);

/**
 * @swagger
 * /nav/loc/{id}:
 *   put:
 *     summary: Update a location
 *     tags: [Locations]
 *     security:
 *       - customTokenAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The ID of the location
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Location'
 *     responses:
 *       200:
 *         description: Location updated successfully
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Location not found
 *       500:
 *         description: Internal Server Error
 */
router.put("/loc/:id", authenticateToken, navController.updateLoc);

/**
 * @swagger
 * /nav/loc/{id}:
 *   delete:
 *     summary: Delete a location
 *     tags: [Locations]
 *     security:
 *       - customTokenAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The ID of the location
 *     responses:
 *       200:
 *         description: Location deleted successfully
 *       404:
 *         description: Location not found
 *       500:
 *         description: Internal Server Error
 */
router.delete("/loc/:id", authenticateToken, navController.deleteLoc);

/**
 * @swagger
 * /nav/realloc/add:
 *   post:
 *     summary: Create a new real location
 *     tags: [RealLocations]
 *     security:
 *       - customTokenAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RealLocation'
 *     responses:
 *       201:
 *         description: Real location created successfully
 *       500:
 *         description: Internal Server Error
 */
router.post("/realloc/add", authenticateToken, navController.addRealLoc);

/**
 * @swagger
 * /nav/realloc:
 *   get:
 *     summary: Get all real locations
 *     tags: [RealLocations]
 *     security:
 *       - customTokenAuth: []
 *     responses:
 *       200:
 *         description: A list of real locations
 *       500:
 *         description: Internal Server Error
 */
router.get("/realloc", authenticateToken, navController.allRealLocs);

/**
 * @swagger
 * /nav/realloc/{id}:
 *   get:
 *     summary: Get a single real location
 *     tags: [RealLocations]
 *     security:
 *       - customTokenAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The ID of the real location
 *     responses:
 *       200:
 *         description: A single real location
 *       404:
 *         description: Real location not found
 *       500:
 *         description: Internal Server Error
 */
router.get("/realloc/:id", authenticateToken, navController.getRealLoc);

/**
 * @swagger
 * /nav/realloc/{id}:
 *   put:
 *     summary: Update a real location
 *     tags: [RealLocations]
 *     security:
 *       - customTokenAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The ID of the real location
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RealLocation'
 *     responses:
 *       200:
 *         description: Real location updated successfully
 *       404:
 *         description: Real location not found
 *       500:
 *         description: Internal Server Error
 */
router.put("/realloc/:id", authenticateToken, navController.updateRealLoc);

/**
 * @swagger
 * /nav/realloc/{id}:
 *   delete:
 *     summary: Delete a real location
 *     tags: [RealLocations]
 *     security:
 *       - customTokenAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The ID of the real location
 *     responses:
 *       200:
 *         description: Real location deleted successfully
 *       404:
 *         description: Real location not found
 *       500:
 *         description: Internal Server Error
 */
router.delete("/realloc/:id", authenticateToken, navController.deleteRealLoc);

/**
 * @swagger
 * /nav/distress/add:
 *   post:
 *     summary: Create a new distress
 *     tags: [Distress]
 *     security:
 *       - customTokenAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Distress'
 *     responses:
 *       201:
 *         description: Distress created successfully
 *       500:
 *         description: Internal Server Error
 */
router.post("/distress/add", authenticateToken, navController.addDistress);

/**
 * @swagger
 * /nav/distress:
 *   get:
 *     summary: Get all distress
 *     tags: [Distress]
 *     security:
 *       - customTokenAuth: []
 *     responses:
 *       200:
 *         description: A list of distress
 *       500:
 *         description: Internal Server Error
 */
router.get("/distress", authenticateToken, navController.allDistress);

/**
 * @swagger
 * /nav/distress/{id}:
 *   get:
 *     summary: Get a single distress
 *     tags: [Distress]
 *     security:
 *       - customTokenAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The ID of the distress
 *     responses:
 *       200:
 *         description: A single distress
 *       404:
 *         description: Distress not found
 *       500:
 *         description: Internal Server Error
 */
router.get("/distress/:id", authenticateToken, navController.getDistress);

/**
 * @swagger
 * /nav/report/add:
 *   post:
 *     summary: Add a report
 *     tags: [Reports]
 *     security:
 *       - customTokenAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Report'
 *     responses:
 *       201:
 *         description: Report added successfully
 *       500:
 *         description: Internal Server Error
 */
router.post("/report/add", authenticateToken, navController.addReport);

/**
 * @swagger
 * /nav/report:
 *   get:
 *     summary: Get all reports
 *     tags: [Reports]
 *     security:
 *       - customTokenAuth: []
 *     responses:
 *       200:
 *         description: A list of reports
 *       500:
 *         description: Internal Server Error
 */
router.get("/report", authenticateToken, navController.allReports);

/**
 * @swagger
 * /nav/report/{id}:
 *   get:
 *     summary: Get a report by ID
 *     tags: [Reports]
 *     security:
 *       - customTokenAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The ID of the report
 *     responses:
 *       200:
 *         description: A single report
 *       404:
 *         description: Report not found
 *       500:
 *         description: Internal Server Error
 */
router.get("/report/:id", authenticateToken, navController.getReport);

module.exports = router;