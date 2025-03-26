const db = require('../database');
// Remove bcrypt import since we're not using it
// const bcrypt = require('bcrypt');

// Get all users
exports.getUsers = async (req, res) => {
  try {
    const getAllUsersQuery = `
      SELECT u.id, u.name, u.username, u.role_id, r.role_name, num, email 
      FROM users u 
      JOIN roles r ON u.role_id = r.id;
    `;
    const [users] = await db.execute(getAllUsersQuery);
    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Get single user
exports.getUser = async (req, res) => {
  const user_id = req.params.id;

  if (!user_id) {
    return res.status(400).send({ error: true, message: 'Please provide user_id' });
  }

  try {
    const getUserQuery = `
      SELECT u.id, u.name, u.username, u.role_id, r.role_name, num, email 
      FROM users u 
      JOIN roles r ON u.role_id = r.id 
      WHERE u.id = ?;
    `;
    const [user] = await db.execute(getUserQuery, [user_id]);

    if (user.length === 0) {
      return res.status(404).json({ error: true, message: 'Account does not exist' });
    }

    res.status(200).json(user[0]);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Update user
exports.updateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const updates = req.body;
    
    console.log('Updating user:', { 
      userId, 
      updates,
      body: req.body,
      params: req.params
    });

    const connection = await db;
    
    // Build update query dynamically based on provided fields
    const updateFields = [];
    const updateValues = [];
    
    // Only process fields that are actually present in the updates object
    Object.keys(updates).forEach(key => {
      switch(key) {
        case 'name':
        case 'username':
        case 'email':
        case 'num':
        case 'address':
          updateFields.push(`${key} = ?`);
          updateValues.push(updates[key]);
          break;
        case 'isOnline':
          updateFields.push('isOnline = ?');
          updateValues.push(updates.isOnline ? 1 : 0);
          break;
        // Add password case separately if needed
      }
    });

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    const updateQuery = `
      UPDATE users 
      SET ${updateFields.join(', ')}
      WHERE id = ?
    `;
    updateValues.push(userId);

    console.log('SQL Debug:', {
      query: updateQuery,
      values: updateValues,
      sql: connection.format(updateQuery, updateValues)
    });

    const [result] = await connection.query(updateQuery, updateValues);

    console.log('Update result:', result);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ 
      message: 'User updated successfully',
      updates: updates,
      result: result
    });

  } catch (error) {
    console.error('Error updating user:', {
      message: error.message,
      sql: error.sql
    });
    res.status(500).json({ 
      error: 'Failed to update user', 
      details: error.message
    });
  }
};

// Delete user
exports.deleteUser = async (req, res) => {
  try {
    const user_id = req.params.id;

    if (!user_id) {
      return res.status(400).json({ error: true, message: 'Please provide user_id' });
    }

    const deleteQuery = 'DELETE FROM users WHERE id = ?';
    const [result] = await db.execute(deleteQuery, [user_id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: true, message: 'User not found' });
    }

    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};