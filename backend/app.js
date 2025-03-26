const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();
const SwaggerSetup = require('./swagger');

const app = express();
const PORT = process.env.PORT || 5000;

const authRoute = require('./routes/auth');
const usersRoute = require('./routes/users');
const navRoute = require('./routes/nav');
const zonesRoute = require('./routes/zones');

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Swagger setup
SwaggerSetup(app);

// Debug middleware to log all requests
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

// Routes
app.use('/auth', authRoute);
app.use('/users', usersRoute);
app.use('/nav', navRoute);
app.use('/zones', zonesRoute);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`Swagger is running on http://localhost:${PORT}/api-docs`);
});