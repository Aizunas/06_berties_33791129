const express = require("express");
const router = express.Router();
const db = global.db; // using the same database pool from index.js

// Middleware to protect routes - FIXED
const redirectLogin = (req, res, next) => {
    if (!req.session.userId) {
        // Get basePath from shopData - FIXED
        const basePath = req.app.locals.shopData?.basePath || '';
        return res.redirect(`${basePath}/users/login`);
    }
    next();
};

// ---------------------------
// Protected Routes
// ---------------------------

router.get('/list', redirectLogin, (req, res, next) => {
    db.query("SELECT * FROM books", (err, result) => {
        if (err) return next(err);
        res.render("list", { availableBooks: result });
    });
});

router.get('/add', redirectLogin, (req, res) => res.render('addbook'));

router.post('/bookadded', redirectLogin, (req, res, next) => {
    const name = req.sanitize(req.body.name);
    const price = parseFloat(req.body.price);
    if (isNaN(price) || price < 0) return res.send("Invalid price");

    db.query("INSERT INTO books (name, price) VALUES (?, ?)", [name, price], (err) => {
        if (err) return next(err);
        res.send(`Book added: ${name}, Price: £${price}`);
    });
});

// ---------------------------
// Public Routes
// ---------------------------

router.get('/bargainbooks', (req, res, next) => {
    db.query("SELECT name, price FROM books WHERE price < 20", (err, result) => {
        if (err) return next(err);
        res.render("list", { availableBooks: result });
    });
});

router.get('/search', (req, res) => res.render("search"));

router.get('/search-result', (req, res, next) => {
    let keyword = req.sanitize(req.query.keyword);
    if (!keyword) return res.render("list", { availableBooks: [] });

    db.query("SELECT name, price FROM books WHERE name LIKE ?", ['%' + keyword + '%'], (err, result) => {
        if (err) return next(err);
        res.render("list", { availableBooks: result });
    });
});

module.exports = router;