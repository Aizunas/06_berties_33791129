require('dotenv').config();

// Import required modules
var session = require('express-session');
var express = require('express');
var ejs = require('ejs');
var mysql = require('mysql2');


// Create the express application
const app = express();
const port = 8000;

// Set up the body parser
app.use(express.urlencoded({ extended: true }));

// Set up css
app.use(express.static(__dirname + '/public'));

// Create a session
app.use(session({
    secret: 'somerandomstuff',
    resave: false,
    saveUninitialized: false,
    cookie: {
        expires: 600000
    }
}));

// Set the directory where Express will pick up HTML files
app.set('views', __dirname + '/views');

// Tell Express that we want to use EJS as the templating engine
app.set('view engine', 'ejs');

// Tells Express how we should process html files
app.engine('html', ejs.renderFile);

// Define the database connection pool
const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});

global.db = db;

// Define our application-specific data
app.locals.shopData = { shopName: "Berties Books" };

// Load the route handlers
const mainRoutes = require("./routes/main");
app.use('/', mainRoutes);

const booksRoutes = require('./routes/books');
app.use('/books', booksRoutes);

const usersRoutes = require('./routes/users');
app.use('/users', usersRoutes);

// Start the web app listening
app.listen(port, () => console.log(`Example app listening on port ${port}!`));