const db = require("../database");

// Add a new location
exports.addLoc = async (req, res) => {
  try {
    const userId = req.userId;
    const { name, latitude, longitude } = req.body;

    if (!name || !latitude || !longitude) {
      return res.status(400).json({
        error: "Invalid input",
        message: "Please provide name, latitude, and longitude",
      });
    }

    const createLocationQuery =
      "INSERT INTO location (name, user_id, coordinates) VALUES (?, ?, POINT(?, ?))";
    await db.execute(createLocationQuery, [name, userId, latitude, longitude]);

    res.status(201).json({ message: "Location created successfully" });
  } catch (error) {
    console.error("Error adding location:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Get all locations
exports.allLocs = async (req, res) => {
  try {
    const userId = req.userId;
    const getAllLocationsQuery = "SELECT * FROM location WHERE user_id = ?";
    const [locations] = await db.execute(getAllLocationsQuery, [userId]);

    res.json(locations);
  } catch (error) {
    console.error("Error getting locations:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Get location by ID
exports.getLoc = async (req, res) => {
  try {
    const locationId = req.params.id;
    const userId = req.userId;
    const getLocationQuery =
      "SELECT * FROM location WHERE id = ? AND user_id = ?";
    const [location] = await db.execute(getLocationQuery, [locationId, userId]);

    if (location.length === 0) {
      return res.status(404).json({ error: "Location not found" });
    }

    res.json(location[0]);
  } catch (error) {
    console.error("Error getting location:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Update location
exports.updateLoc = async (req, res) => {
  try {
    const locationId = req.params.id;
    const { name, latitude, longitude } = req.body;
    const userId = req.userId;

    if (!name || !latitude || !longitude) {
      return res.status(400).json({
        error: "Invalid input",
        message: "Please provide name, latitude, and longitude",
      });
    }

    const updateLocationQuery =
      "UPDATE location SET name = ?, coordinates = POINT(?, ?) WHERE id = ? AND user_id = ?";
    await db.execute(updateLocationQuery, [
      name,
      latitude,
      longitude,
      locationId,
      userId,
    ]);

    res.json({ message: "Location updated successfully" });
  } catch (error) {
    console.error("Error updating location:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Delete location
exports.deleteLoc = async (req, res) => {
  try {
    const locationId = req.params.id;
    const userId = req.userId;

    const deleteLocationQuery =
      "DELETE FROM location WHERE id = ? AND user_id = ?";
    await db.execute(deleteLocationQuery, [locationId, userId]);

    res.json({ message: "Location deleted successfully" });
  } catch (error) {
    console.error("Error deleting location:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Real location Table
// Create a new real location
exports.addRealLoc = async (req, res) => {
  try {
    const { loc_id, latitude, longitude } = req.body;
    const userId = req.userId;

    const createRealLocationQuery =
      "INSERT INTO realLocation (location_at, user_id, loc_id, coordinates) VALUES (CURRENT_TIMESTAMP(), ?, ?, POINT(?, ?))";
    await db.execute(createRealLocationQuery, [
      userId,
      loc_id,
      latitude,
      longitude,
    ]);

    res.status(201).json({ message: "Real location created successfully" });
  } catch (error) {
    console.error("Error creating real location:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Read all real locations
exports.allRealLocs = async (req, res) => {
  try {
    const userId = req.userId;
    const getAllRealLocationsQuery =
      "SELECT * FROM realLocation WHERE user_id = ?";
    const [realLocations] = await db.execute(getAllRealLocationsQuery, [
      userId,
    ]);

    res.json(realLocations);
  } catch (error) {
    console.error("Error getting real locations:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Read real location by ID
exports.getRealLoc = async (req, res) => {
  try {
    const realLocationId = req.params.id;
    const userId = req.userId;
    const getRealLocationQuery =
      "SELECT * FROM realLocation WHERE id = ? AND user_id = ?";
    const [realLocation] = await db.execute(getRealLocationQuery, [
      realLocationId,
      userId,
    ]);

    if (realLocation.length === 0) {
      return res.status(404).json({ error: "Real location not found" });
    }

    res.json(realLocation[0]);
  } catch (error) {
    console.error("Error getting real location by ID:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Update real location
exports.updateRealLoc = async (req, res) => {
  try {
    const realLocationId = req.params.id;
    const { loc_id} = req.body;
    const userId = req.userId;

    const updateRealLocationQuery =
      "UPDATE realLocation SET loc_id = ? WHERE id = ? AND user_id = ?";
    await db.execute(updateRealLocationQuery, [
      loc_id,
      realLocationId,
      userId,
    ]);

    res.json({ message: "Real location updated successfully" });
  } catch (error) {
    console.error("Error updating real location:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Delete real location
exports.deleteRealLoc = async (req, res) => {
  try {
    const realLocationId = req.params.id;
    const userId = req.userId;

    const deleteRealLocationQuery =
      "DELETE FROM realLocation WHERE id = ? AND user_id = ?";
    await db.execute(deleteRealLocationQuery, [realLocationId, userId]);

    res.json({ message: "Real location deleted successfully" });
  } catch (error) {
    console.error("Error deleting real location:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Fetch the most recent real location for the user
exports.latestRealLoc = async (req, res) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const getLatestRealLocationQuery = `
      SELECT * FROM realLocation 
      WHERE user_id = ? 
      ORDER BY location_at DESC 
      LIMIT 1
    `;

    console.log(`[INFO]: Executing query to fetch latest real location for user: ${userId}`);

    const [latestRealLocation] = await db.execute(getLatestRealLocationQuery, [userId]);

    if (latestRealLocation.length === 0) {
      return res.status(404).json({ error: "Real location not found" });
    }

    console.log('[SUCCESS]: Latest real location fetched:', latestRealLocation[0]);

    res.json({ success: true, data: latestRealLocation[0] });
  } catch (error) {
    console.error('[ERROR]: Fetching latest real location:', error.message);

    if (error.code === 'ER_BAD_DB_ERROR') {
      return res.status(500).json({ error: 'Database connection issue' });
    }

    res.status(500).json({ error: 'Internal Server Error' });
  }
};


// Distress Table
// Create distress
exports.addDistress = async (req, res) => {
  try {
    const { type, real_id, contact_ids } = req.body;
    const userId = req.userId;

    // Insert into distress table
    const distressInsertQuery = `
          INSERT INTO distress (description, user_id, distress_at, real_id)
          VALUES (?, ?, CONVERT_TZ(NOW(), '+00:00', '+08:00'), ?)
        `;
    const [distressResult] = await db.execute(distressInsertQuery, [
      type,
      userId,
      real_id,
    ]);

    const distressId = distressResult.insertId;

    // Insert into distress_contacts table for each contact
    const distressContactsInsertQuery =
      "INSERT INTO distress_contacts (distress_id, contact_id) VALUES (?, ?)";
    for (const contactId of contact_ids) {
      await db.execute(distressContactsInsertQuery, [distressId, contactId]);
    }

    res.status(201).json({ message: "Distress signal created successfully" });
  } catch (error) {
    console.error("Error creating distress signal:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Get all distress history
exports.allDistress = async (req, res) => {
  try {
    // Query to retrieve all distress signals along with their associated contacts
    const getAllDistressQuery = `
    SELECT d.*, GROUP_CONCAT(c.name) AS contact_names
    FROM distress d
    LEFT JOIN distress_contacts dc ON d.id = dc.distress_id
    LEFT JOIN contacts c ON dc.contact_id = c.id
    GROUP BY d.id;
    `;

    // Execute the query
    const [distressSignals] = await db.execute(getAllDistressQuery);

    // Send the distress signals as a response
    res.json(distressSignals);
  } catch (error) {
    console.error("Error getting all distress signals:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Get distress by id
exports.getDistress = async (req, res) => {
  try {
    const distressId = req.params.id;

    // Query to retrieve distress signal by ID
    const getDistressByIdQuery = `
      SELECT d.*, GROUP_CONCAT(c.name) AS contact_names
      FROM distress d
      LEFT JOIN distress_contacts dc ON d.id = dc.distress_id
      LEFT JOIN contacts c ON dc.contact_id = c.id
      WHERE d.id = ?
      GROUP BY d.id;
    `;

    // Execute the query
    const [distressSignal] = await db.execute(getDistressByIdQuery, [
      distressId,
    ]);

    // Check if distress signal exists
    if (distressSignal.length === 0) {
      return res.status(404).json({ error: "Distress signal not found" });
    }

    // Send the distress signal as a response
    res.json(distressSignal[0]);
  } catch (error) {
    console.error("Error getting distress signal by ID:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Reports table
//Add Report
exports.addReport = async (req, res) => {
  try {
    const { user_report, address, loc_id } = req.body;
    const userId = req.userId;

    // Fetch authority contact IDs
    const getAuthorityContactsQuery = 'SELECT id FROM contacts WHERE LOWER(type) = ?';
    const [authorityContacts] = await db.execute(getAuthorityContactsQuery, ['authority']);

    if (authorityContacts.length === 0) {
      const [authorityContactsCapitalized] = await db.execute(
        getAuthorityContactsQuery,
        ["Authority"]
      );
      authorityContacts = authorityContactsCapitalized;
    }
    console.log("Authority Contacts:", authorityContacts);

    const contactIds = authorityContacts.map((contact) => contact.id);

    const reportInsertQueries = contactIds.map((contactId) => {
      return "INSERT INTO report (user_id, contact_id, user_report, address, loc_id) VALUES (?, ?, ?, ?, ?)";
    });

    for (const contactId of contactIds) {
      for (const query of reportInsertQueries) {
        await db.execute(query, [
          userId,
          contactId,
          user_report,
          address,
          loc_id,
        ]);
      }
    }

    res.status(201).json({ message: 'Report sent to authority contacts successfully' });
  } catch (error) {
    console.error('Error creating report:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};



// Get all reports
exports.allReports = async (req, res) => {
  try {
    const userId = req.userId;
    const getAllReportsQuery = "SELECT * FROM report WHERE user_id = ?";
    const [reports] = await db.execute(getAllReportsQuery, [userId]);

    res.json(reports);
  } catch (error) {
    console.error("Error getting all reports:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Get report by id
exports.getReport = async (req, res) => {
  try {
    const userId = req.userId;
    const reportId = req.params.id;
    const getReportByIdQuery =
      "SELECT * FROM report WHERE id = ? AND user_id = ?";
    const [report] = await db.execute(getReportByIdQuery, [reportId, userId]);

    if (report.length === 0) {
      return res.status(404).json({ error: "Report not found" });
    }

    res.json(report[0]);
  } catch (error) {
    console.error("Error getting report by ID:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
