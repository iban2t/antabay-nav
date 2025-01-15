const mysql = require('mysql2');
require('dotenv').config();

const db = mysql.createConnection({
    host: process.env.DBHOST,
    user: process.env.DBUSER,
    password: process.env.DBPASSWORD,
    database: process.env.DBNAME,
    port: process.env.DBPORT
});

db.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL', err);
    } else {
        console.log('Connected to MySQL');
    }
});

module.exports = db;