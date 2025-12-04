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

// BASE PATH for VM deployment - handle both environments
const BASE_PATH = process.env.BASE_PATH || '';

// Detect if running on VM (has BASE_PATH) vs local
const isVM = !!process.env.BASE_PATH;

// Trust proxy ONLY on VM
if (isVM) {
    app.set('trust proxy', 1);
}

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(expressSanitizer()); // sanitize incoming data
app.use(express.static(path.join(__dirname, 'public')));

// Sessions - UNIVERSAL configuration
app.use(session({
    secret: process.env.SESSION_SECRET || 'somerandomstuff',
    resave: false,
    saveUninitialized: false,
    cookie: { 
        expires: 600000,
        path: '/',  // Always root path for both environments
        secure: isVM, // true on VM (HTTPS), false locally (HTTP)
        httpOnly: true,
        sameSite: 'lax'
    }
}));

// Make session and BASE_PATH available in ALL views and routes
app.use((req, res, next) => {
    // Store BASE_PATH in request for all route files to use
    req.BASE_PATH = BASE_PATH;
    
    // Make available in EJS templates
    res.locals.session = req.session;
    res.locals.BASE_PATH = BASE_PATH;
    res.locals.isVM = isVM;
    
    // Also store in app.locals for route files that need it
    req.app.locals.basePath = BASE_PATH;
    
    next();
});

// Set EJS as view engine
app.set('view engine', 'ejs');

// Application-specific data - THIS IS CRITICAL
app.locals.shopData = { 
    shopName: "Bertie's Books",
    basePath: BASE_PATH 
};

// Database connection
const db = mysql.createPool({
    host: 'localhost',
    user: process.env.BB_USER || 'berties_books_app',
    password: process.env.BB_PASSWORD || 'qwertyuiop',
    database: process.env.BB_DATABASE || 'berties_books',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});
global.db = db;

// Debug route to check shopData
app.get('/debug-shopdata', (req, res) => {
    res.send(`
        <h1>shopData Debug</h1>
        <p>app.locals.shopData: ${JSON.stringify(app.locals.shopData)}</p>
        <p>req.app.locals.shopData: ${JSON.stringify(req.app.locals.shopData)}</p>
        <p>BASE_PATH env: "${BASE_PATH}"</p>
    `);
});

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
        console.log('Environment:', isVM ? 'VM' : 'Local');
        console.log('BASE_PATH:', BASE_PATH || '(empty)');
        connection.release();
    }
});

// Request logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    console.log('Session user:', req.session.userId || 'none');
    next();
});

// Start server
app.listen(port, () => {
    console.log(`App listening on port ${port}!`);
    console.log(`Access at: http://localhost:${port}${BASE_PATH}`);
});