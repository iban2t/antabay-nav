const express = require('express');
const router = express.Router();
const zonesController = require('../controllers/zonesController');
const authenticateToken = require('../middleware/authenticateToken');

/**
 * @swagger
 * tags:
 *   name: Zones
 *   description: Zones management
 */

/**
 * @swagger
 * /zones/zones:
 *   get:
 *     summary: Get all zones
 *     tags: [Zones]
 *     security:
 *       - customTokenAuth: []
 *     responses:
 *       200:
 *         description: List of all zones
 *       500:
 *         description: Internal Server Error
 */
router.get('/zones', authenticateToken, zonesController.allZones);

/**
 * @swagger
 * /zones/zones/{id}:
 *   get:
 *     summary: Get a single zone by ID
 *     tags: [Zones]
 *     security:
 *       - customTokenAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Zone ID
 *     responses:
 *       200:
 *         description: Zone details
 *       404:
 *         description: Zone not found
 *       500:
 *         description: Internal Server Error
 */
router.get('/zones/:id', authenticateToken, zonesController.getZone);

module.exports = router;