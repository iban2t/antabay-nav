const db = require('../database');

//Zones table
//Automatically create zone
const checkAndCreateZones = async () => {
    try {
      // Query to retrieve distinct location IDs from the realLocation table
      const locationIdsQuery = 'SELECT DISTINCT loc_id FROM realLocation';
      const [locationIds] = await db.promise().query(locationIdsQuery);
  
      // Thresholds for distress signals and reports
      const distressThreshold = 2; //threshold for distress signals
      const reportThreshold = 2; //threshold for reports
      
      // Iterate over each location
      for (const { loc_id } of locationIds) {
        // Query to count the number of distress signals for the location
        const distressCountQuery = 'SELECT COUNT(*) AS distress_count FROM distress WHERE real_id = ?';
        const [[{ distress_count }]] = await db.promise().query(distressCountQuery, [loc_id]);
  
        // Query to count the number of reports for the location
        const reportCountQuery = 'SELECT COUNT(*) AS report_count FROM report WHERE loc_id = ?';
        const [[{ report_count }]] = await db.promise().query(reportCountQuery, [loc_id]);
  
        // If distress signals or reports exceed the thresholds, create a new zone entry
        if (distress_count >= distressThreshold || report_count >= reportThreshold) {
          const zoneType = 'Danger Zone'; // Assuming any activity triggers a danger zone
          const insertQuery = 'INSERT INTO zones (type, loc_id) VALUES (?, ?)';
          await db.promise().execute(insertQuery, [zoneType, loc_id]);
        }
      }
    } catch (error) {
      console.error('Error checking and creating zones:', error.message);
    }
  };
  
  // Execute the checkAndCreateZones function periodically (e.g., every hour)
  // setInterval(checkAndCreateZones, 3600000);

  //Get all zones
exports.allZones = async (req, res) => {
    try {
      // Query to retrieve all zones with location names
      const query = `
        SELECT z.id, z.type, l.name AS location_name
        FROM zones z
        INNER JOIN location l ON z.loc_id = l.id
      `;
      const [zones] = await db.promise().query(query);
  
      res.status(200).json({ zones });
    } catch (error) {
      console.error('Error fetching zones:', error.message);
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
      const [[zone]] = await db.promise().query(query, [id]);
  
      if (!zone) {
        return res.status(404).json({ error: 'Zone not found' });
      }
  
      res.status(200).json({ zone });
    } catch (error) {
      console.error('Error fetching zone:', error.message);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };