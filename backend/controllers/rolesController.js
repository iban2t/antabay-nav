const db = require('../database');

//Add new role
exports.addRole = async (req, res) => {
    try {
        const { role_code, role_name } = req.body;
    
      //Require input across all fields
      if (!role_code || !role_name) {
        return res.status(400).json({ error: 'Invalid input', message: 'Please provide role_code and role_name' });
      }
    
        const insertUserQuery = 'INSERT INTO roles (role_code, role_name) VALUES (?, ?)';
        await db.promise().execute(insertUserQuery, [role_code, role_name]);
    
        res.status(201).json({ message: 'Role added successfully!' });
      } catch (error) {
        console.error('Error adding role', error);
    
        //Avoid duplicate role
        if (error.code === 'ER_DUP_ENTRY') {
          return res.status(409).json({ error: 'Role already exists', message: 'Please choose a different role' });
        }
    
        res.status(500).json({ error: 'Internal Server Error' });
      }
}; 

//Get all roles
exports.getRoles = async (req, res) => {
    
    try{

        db.query('SELECT * FROM roles', (err, result) => {
            if (err) {
                console.error('Error fetching items:', err);
                res.status(500).json({ message: 'Internal Server Error '});
            } else {
                res.status(200).json(result);
            }
        });   

    } catch (error) {

        console.error('Error loading user:', error);
        res.status(500).json({ error: 'Internal Server Error' });

    }
};

//Get single role
exports.getRole = async (req, res) => {
    let role_id = req.params.id;

    if (!role_id) {
        return res.status(400).send({ error: true, message: 'Please provide role_id' });
    }

    try{
        db.query('SELECT * FROM roles WHERE id = ?', role_id, (err, result) => {
            if (err){
                console.error('Error fetching items:', err);
                res.status(500).json({ message: 'Internal Server Error' });
            } else {
                if (result.length === 0) {
                    // No role found with the provided ID
                    return res.status(404).json({ error: true, message: 'Role does not exist' });
                }
                res.status(200).json(result);
            }
        });
    } catch (error) {
        console.error('Error loading role:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

//Update Role
exports.updateRole = async (req, res) => {
    try {
        const role_id = req.params.id;
        const { role_code, role_name } = req.body;
  
        if (!role_code || !role_name) {
            return res.status(400).json({ error: 'Invalid input', message: 'Please provide role code and role name' });
        }
  
        const updateQuery = 'UPDATE roles SET role_code = ?, role_name = ? WHERE id = ?';
        db.query(updateQuery, [role_code, role_name, role_id], (err, result, fields) => {
            if (err) {
                console.error(`Error updating role ${role_id}:`, err);
                return res.status(500).json({ message: 'Internal Server Error' });
            } else {
                if (result.affectedRows === 0) {
                    // No role found with the provided ID
                    return res.status(404).json({ error: true, message: 'role does not exist' });
                }
                return res.status(200).json(result);
            }
        });
    } catch (error) {
        console.error('Error updating role:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
  };

//Delete Role
exports.deleteRole = async (req, res) => {
    try {
        const role_id = req.params.id;
  
        if (!role_id) {
            return res.status(400).json({ error: true, message: 'Please provide role_id' });
        }
  
        const deleteQuery = 'DELETE FROM roles WHERE id = ?';
        db.query(deleteQuery, role_id, (err, result, fields) => {
            if (err) {
                console.error('Error deleting role:', err);
                res.status(500).json({ message: 'Internal Server Error' });
            } else {
                if (result.affectedRows > 0) {
                    // Check if any rows were affected (indicating successful deletion)
                    res.status(200).json({ message: 'Role deleted successfully' });
                } else {
                    // No rows affected means user with specified ID was not found
                    res.status(404).json({ error: true, message: 'Role not found' });
                }
            }
        });
    } catch (error) {
        console.error('Error deleting role:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
  };