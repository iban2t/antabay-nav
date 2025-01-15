const db = require('../database');

// Add new role
exports.addRole = async (req, res) => {
  try {
    const { role_code, role_name } = req.body;

    // Require input across all fields
    if (!role_code || !role_name) {
      return res.status(400).json({ error: 'Invalid input', message: 'Please provide role_code and role_name' });
    }

    const insertUserQuery = 'INSERT INTO roles (role_code, role_name) VALUES (?, ?)';
    await db.execute(insertUserQuery, [role_code, role_name]);

    res.status(201).json({ message: 'Role added successfully!' });
  } catch (error) {
    console.error('Error adding role', error);

    // Avoid duplicate role
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Role already exists', message: 'Please choose a different role' });
    }

    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Get all roles
exports.getRoles = async (req, res) => {
  try {
    const getAllRolesQuery = 'SELECT * FROM roles';
    const [roles] = await db.execute(getAllRolesQuery);

    res.status(200).json(roles);
  } catch (error) {
    console.error('Error fetching roles:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Get single role
exports.getRole = async (req, res) => {
  const role_id = req.params.id;

  if (!role_id) {
    return res.status(400).send({ error: true, message: 'Please provide role_id' });
  }

  try {
    const getRoleQuery = 'SELECT * FROM roles WHERE id = ? AND user_id = ?';
    const [role] = await db.execute(getRoleQuery, [role_id]);

    if (role.length === 0) {
      return res.status(404).json({ error: true, message: 'Role does not exist' });
    }

    res.status(200).json(role[0]);
  } catch (error) {
    console.error('Error fetching role:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Update role
exports.updateRole = async (req, res) => {
  try {
    const role_id = req.params.id;
    const { role_code, role_name } = req.body;

    if (!role_code || !role_name) {
      return res.status(400).json({ error: 'Invalid input', message: 'Please provide role code and role name' });
    }

    const updateQuery = 'UPDATE roles SET role_code = ?, role_name = ? WHERE id = ?';
    const [result] = await db.execute(updateQuery, [role_code, role_name, role_id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: true, message: 'Role does not exist' });
    }

    res.status(200).json({ message: 'Role updated successfully' });
  } catch (error) {
    console.error('Error updating role:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Delete role
exports.deleteRole = async (req, res) => {
  try {
    const role_id = req.params.id;

    if (!role_id) {
      return res.status(400).json({ error: true, message: 'Please provide role_id' });
    }

    const deleteQuery = 'DELETE FROM roles WHERE id = ?';
    const [result] = await db.execute(deleteQuery, [role_id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: true, message: 'Role not found' });
    }

    res.status(200).json({ message: 'Role deleted successfully' });
  } catch (error) {
    console.error('Error deleting role:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};