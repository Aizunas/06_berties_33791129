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

// BASE PATH for VM deployment
const BASE_PATH = process.env.BASE_PATH || '';

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

// Make session and BASE_PATH available in EJS
app.use((req, res, next) => {
    res.locals.session = req.session;
    res.locals.BASE_PATH = BASE_PATH;
    next();
});

// Set EJS as view engine
app.set('view engine', 'ejs');

// Application-specific data
app.locals.shopData = { 
    shopName: "Bertie's Books",
    basePath: BASE_PATH 
};

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

const weatherRoutes = require('./routes/weather');
app.use('/weather', weatherRoutes);

const apiRoutes = require('./routes/api');
app.use('/api', apiRoutes);

const aboutRoutes = require('./routes/about');
app.use('/about', aboutRoutes);

// Database connection check
db.getConnection((err, connection) => {
    if (err) {
        console.error('Database connection failed:', err);
        process.exit(1);
    } else {
        console.log('Database connected successfully');
        connection.release();
    }
});

// Request logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Start server
app.listen(port, () => console.log(`App listening on port ${port}!`));