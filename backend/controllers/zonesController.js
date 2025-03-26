const db = require('../database');

// Zones table
// Automatically create zone
const checkAndCreateZones = async () => {
  try {
    // Query to retrieve distinct location IDs from the realLocation table
    const locationIdsQuery = 'SELECT DISTINCT loc_id FROM realLocation';
    const [locationIds] = await db.execute(locationIdsQuery);

    // Thresholds for distress signals and reports
    const distressThreshold = 2; // threshold for distress signals
    const reportThreshold = 2;   // threshold for reports

    // Iterate over each location
    for (const { loc_id } of locationIds) {
      // First check if zone already exists for this location
      const existingZoneQuery = 'SELECT id FROM zones WHERE loc_id = ?';
      const [existingZones] = await db.execute(existingZoneQuery, [loc_id]);

      // Only proceed if no zone exists for this location
      if (existingZones.length === 0) {
        // Query to count the number of distress signals for the location
        const distressCountQuery = 'SELECT COUNT(*) AS distress_count FROM distress WHERE real_id = ?';
        const [[{ distress_count }]] = await db.execute(distressCountQuery, [loc_id]);

        // Query to count the number of reports for the location
        const reportCountQuery = 'SELECT COUNT(*) AS report_count FROM report WHERE loc_id = ?';
        const [[{ report_count }]] = await db.execute(reportCountQuery, [loc_id]);

        // If distress signals or reports exceed the thresholds, create a new zone entry
        if (distress_count >= distressThreshold || report_count >= reportThreshold) {
          const zoneType = 'Danger Zone';
          const insertQuery = 'INSERT INTO zones (type, loc_id) VALUES (?, ?)';
          await db.execute(insertQuery, [zoneType, loc_id]);
        }
      }
    }
  } catch (error) {
    console.error('Error checking and creating zones:', error.message);
  }
};

// Execute the checkAndCreateZones function periodically (e.g., every hour)
// setInterval(checkAndCreateZones, 3600000);

// Get all zones
exports.allZones = async (req, res) => {
  try {
    const query = `
      SELECT 
        z.id,
        z.type, 
        l.name AS location_name,
        ST_X(l.coordinates) as latitude,
        ST_Y(l.coordinates) as longitude,
        (
          SELECT COUNT(*) 
          FROM distress d 
          JOIN realLocation rl ON d.real_id = rl.id 
          WHERE rl.loc_id = z.loc_id
        ) as distress_count,
        (
          SELECT COUNT(*) 
          FROM report r 
          WHERE r.loc_id = z.loc_id
        ) as report_count
      FROM zones z
      INNER JOIN location l ON z.loc_id = l.id
      ORDER BY l.name, z.id
    `;
    const [zones] = await db.execute(query);
    res.status(200).json({ zones });
  } catch (error) {
    console.error('Error fetching zones:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Get zone by ID with location name
exports.getZone = async (req, res) => {
  try {
    const { id } = req.params;

    // Query to retrieve zone by ID with location name
    const query = `
      SELECT z.id, z.type, l.name AS location_name
      FROM zones z
      INNER JOIN location l ON z.loc_id = l.id
      WHERE z.id = ?
    `;
    const [[zone]] = await db.execute(query, [id]);

    if (!zone) {
      return res.status(404).json({ error: 'Zone not found' });
    }

    res.status(200).json({ zone });
  } catch (error) {
    console.error('Error fetching zone:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};