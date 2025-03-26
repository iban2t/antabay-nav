const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../database");

const config = require("../config/config");
const secret_key = config.secretKey;

// Register
exports.registerUser = async (req, res) => {
  try {
    console.log("Registering user");
    const { name, username, password, role_id, num, email, address } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    if (
      !name ||
      !username ||
      !password ||
      !role_id ||
      !num ||
      !email ||
      !address
    ) {
      return res
        .status(400)
        .json({
          error: "Invalid input",
          message: "Please provide name, username, password, and role id",
        });
    }

    try {
      const insertUserQuery =
        "INSERT INTO users (name, username, password, role_id, num, email, address) VALUES (?, ?, ?, ?, ?, ?, ?)";
      const connection = await db;
      await connection.query(insertUserQuery, [
        name,
        username,
        hashedPassword,
        role_id,
        num,
        email,
        address,
      ]);

      return res.status(201).json({ message: "User registered successfully!" });
    } catch (error) {
      console.error("Error registering user", error);
      if (error.code === "ER_DUP_ENTRY") {
        if (error.message.includes("username")) {
          return res
            .status(409)
            .json({
              error: "Username already exists",
              message: "Please choose a different username",
            });
        } else {
          return res
            .status(409)
            .json({
              error: "Mobile number is already taken",
              message: "Please choose a different mobile number",
            });
        }
      }
      return res.status(500).json({ error: "Internal Server Error" });
    }
  } catch (error) {
    console.error("Error in registerUser function:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;

    try {
      const getUserQuery = "SELECT id, username, password, role_id FROM users WHERE username = ?";
      const connection = await db;
      const [rows] = await connection.query(getUserQuery, [username]);

      if (rows.length === 0) {
        console.error("Invalid username");
        return res.status(401).json({ error: "Invalid username or password" });
      }

      const user = rows[0];
      console.log('Found user:', { id: user.id, username: user.username, role_id: user.role_id });

      const passwordMatch = await bcrypt.compare(password, user.password);

      if (!passwordMatch) {
        console.error("Invalid password");
        return res.status(401).json({ error: "Invalid username or password" });
      }

      // Each user gets their own unique token
      const token = jwt.sign(
        { userId: user.id, username: user.username },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      // Send response with both token and user data
      const response = { 
        token, 
        id: user.id,
        role: user.role_id,
        roleId: user.role_id,
        username: user.username
      };
      console.log('Sending response:', response);

      res.status(200).json(response);

    } catch (error) {
      console.error("Error getting user from database:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  } catch (error) {
    console.error("Error logging in user:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};