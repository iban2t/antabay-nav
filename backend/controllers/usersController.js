const db = require('../database');
const bcrypt = require('bcrypt');

//Get all users
exports.getUsers = async (req, res) => {
    try {
    db.query('SELECT u.id, u.name, u.username, u.role_id, r.role_name, num, email FROM users u JOIN roles r ON u.role_id = r.id;', (err,result) => {
      if (err) {
        console.error('Error fetching items:', err);
        res.status(500).json({ message: 'Internal Server Error '});
      } else {
        console.log(res)
        res.status(200).json(result);
      }
    });

  } catch (error) {
    
    console.error('Error loading user:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

//Get single user
exports.getUser = async (req, res) => {
  let user_id = req.params.id;

  if (!user_id) {
      return res.status(400).send({ error: true, message: 'Please provide user_id' });
  }

  try {
      db.query('SELECT u.id, u.name, u.username, u.role_id, r.role_name, num, email FROM users u JOIN roles r ON u.role_id = r.id WHERE u.id = ?', user_id, (err, result) => {
          if (err) {
              console.error('Error fetching items:', err);
              res.status(500).json({ message: 'Internal Server Error' });
          } else {
              if (result.length === 0) {
                  // No user found with the provided ID
                  return res.status(404).json({ error: true, message: 'Account does not exist' });
              }
              res.status(200).json(result);
          }
      });
  } catch (error) {
      console.error('Error loading user:', error);
      res.status(500).json({ error: 'Internal Server Error' });
  }
};

//Update User
exports.updateUser = async (req, res) => {
  try {
      const user_id = req.params.id;
      const { name, username, password, role_id, num, email } = req.body;
      const hashedPassword = await bcrypt.hash(password, 10);

      if (!user_id || !name || !username || !password || !role_id) {
          return res.status(400).json({ error: 'Invalid input', message: 'Please provide name, username, password, role_id, num, and email' });
      }

      const updateQuery = 'UPDATE users SET name = ?, username = ?, password = ?, role_id = ?, num = ?, email = ? WHERE id = ?';
      db.query(updateQuery, [name, username, hashedPassword, role_id, num, email, user_id], (err, result, fields) => {
          if (err) {
              console.error(`Error updating user ${user_id}:`, err);
              return res.status(500).json({ message: 'Internal Server Error' });
          } else {
              if (result.affectedRows === 0) {
                  // No user found with the provided ID
                  return res.status(404).json({ error: true, message: 'Account does not exist' });
              }
              return res.status(200).json(result);
          }
      });
  } catch (error) {
      console.error('Error updating user:', error);
      res.status(500).json({ error: 'Internal Server Error' });
  }
};

//Delete User
exports.deleteUser = async (req, res) => {
  try {
      const user_id = req.params.id;

      if (!user_id) {
          return res.status(400).json({ error: true, message: 'Please provide user_id' });
      }

      const deleteQuery = 'DELETE FROM users WHERE id = ?';
      db.query(deleteQuery, user_id, (err, result, fields) => {
          if (err) {
              console.error('Error deleting user:', err);
              res.status(500).json({ message: 'Internal Server Error' });
          } else {
              if (result.affectedRows > 0) {
                  // Check if any rows were affected (indicating successful deletion)
                  res.status(200).json({ message: 'User deleted successfully' });
              } else {
                  // No rows affected means user with specified ID was not found
                  res.status(404).json({ error: true, message: 'User not found' });
              }
          }
      });
  } catch (error) {
      console.error('Error deleting user:', error);
      res.status(500).json({ error: 'Internal Server Error' });
  }
};