const express = require("express");
const router = express.Router();

// ---------------------------
// Middleware: Protect routes
// ---------------------------
const redirectLogin = (req, res, next) => {
    if (!req.session.userId) {
        // If not logged in, redirect to login page
        return res.redirect('./login');
    }
    next();
};

// ---------------------------
// Protected Routes
// ---------------------------

// Route: List all books (requires login)
router.get('/list', redirectLogin, (req, res, next) => {
    let sqlquery = "SELECT * FROM books";
    db.query(sqlquery, (err, result) => {
        if (err) return next(err);
        res.render("list.ejs", { availableBooks: result });
    });
});

// Route: Add Book form (requires login)
router.get('/addbook', redirectLogin, (req, res) => {
    res.render('addbook.ejs');
});

// Route: Handle Add Book form submission (requires login)
router.post('/bookadded', redirectLogin, (req, res, next) => {
    let sqlquery = "INSERT INTO books (name, price) VALUES (?, ?)";
    let newrecord = [req.body.name, req.body.price];
    db.query(sqlquery, newrecord, (err, result) => {
        if (err) return next(err);
        res.send(`This book is added to the database. Name: ${req.body.name}, Price: £${req.body.price}`);
    });
});

// ---------------------------
// Public Routes
// ---------------------------

// Route: Bargain books (price < £20) – accessible to everyone
router.get('/bargainbooks', (req, res, next) => {
    let sqlquery = "SELECT name, price FROM books WHERE price < 20";
    db.query(sqlquery, (err, result) => {
        if (err) return next(err);
        res.render("list.ejs", { availableBooks: result });
    });
});

// Route: Search page (form) – accessible to everyone
router.get('/search', (req, res, next) => {
    res.render("search.ejs"); // contains input form
});

// Route: Handle search query (supports partial match) – accessible to everyone
router.get('/search-result', (req, res, next) => {
    let keyword = req.query.keyword;
    if (!keyword) {
        return res.render("list.ejs", { availableBooks: [] });
    }

    let sqlquery = "SELECT name, price FROM books WHERE name LIKE ?";
    let searchTerm = '%' + keyword + '%';

    db.query(sqlquery, [searchTerm], (err, result) => {
        if (err) return next(err);
        res.render("list.ejs", { availableBooks: result });
    });
});

// ---------------------------
// Export the router
// ---------------------------
module.exports = router;

https://www.doc.gold.ac.uk/usr/313/users/register
https://www.doc.gold.ac.uk/usr/313/users/login
https://www.doc.gold.ac.uk/usr/313/users/list
https://www.doc.gold.ac.uk/usr/313/users/audit
https://www.doc.gold.ac.uk/usr/313/logout
