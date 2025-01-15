const db = require('../database');
const bcrypt = require('bcrypt');

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
    const user_id = req.params.id;
    const { name, username, password, role_id, num, email } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    if (!user_id || !name || !username || !password || !role_id) {
      return res.status(400).json({ error: 'Invalid input', message: 'Please provide name, username, password, role_id, num, and email' });
    }

    const updateQuery = `
      UPDATE users 
      SET name = ?, username = ?, password = ?, role_id = ?, num = ?, email = ? 
      WHERE id = ?;
    `;
    const [result] = await db.execute(updateQuery, [name, username, hashedPassword, role_id, num, email, user_id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: true, message: 'Account does not exist' });
    }

    res.status(200).json({ message: 'User updated successfully' });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Internal Server Error' });
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