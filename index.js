// Import express, ejs, mysql, path, dotenv
const express = require('express');
const ejs = require('ejs');
const mysql = require('mysql2');
const path = require('path');
require('dotenv').config();
const expressSanitizer = require('express-sanitizer');
const session = require('express-session');

// Create Express app
const app = express();
const port = 8000;

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(expressSanitizer()); // sanitize incoming data
app.use(express.static(path.join(__dirname, 'public')));

// Sessions
app.use(session({
    secret: process.env.SESSION_SECRET || 'somerandomstuff',
    resave: false,
    saveUninitialized: false,
    cookie: { expires: 600000 } // 10 minutes
}));

// Make session available in EJS
app.use((req, res, next) => {
    res.locals.session = req.session;
    next();
});

// Set EJS as view engine
app.set('view engine', 'ejs');

// Application-specific data
app.locals.shopData = { shopName: "Bertie's Books" };

// Database connection
const db = mysql.createPool({
    host: 'localhost',
    user: process.env.BB_USER,
    password: process.env.BB_PASSWORD,
    database: process.env.BB_DATABASE,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});
global.db = db;

// Load routes
const mainRoutes = require("./routes/main");
app.use('/', mainRoutes);

const usersRoutes = require('./routes/users');
app.use('/users', usersRoutes);

const booksRoutes = require('./routes/books');
app.use('/books', booksRoutes);

// Start server
app.listen(port, () => console.log(`App listening on port ${port}!`));
