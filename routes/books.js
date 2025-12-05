const express = require("express");
const router = express.Router();

// Middleware to redirect if not logged in
const redirectLogin = (req, res, next) => {
    if (!req.session.userId) {
        res.redirect('../users/login');
    } else {
        next();
    }
}

// Route to list all books - PROTECTED
router.get('/list', redirectLogin, function(req, res, next) {
    let sqlquery = "SELECT * FROM books";
    db.query(sqlquery, (err, result) => {
        if (err) {
            next(err);
        }
        res.render("list.ejs", {availableBooks:result});
     });
});

// Route to display add book form - PROTECTED
router.get('/addbook', redirectLogin, function(req, res, next) {
    res.render('addbook.ejs');
});

// Route to handle adding a book - PROTECTED with sanitization
router.post('/bookadded', redirectLogin, function (req, res, next) {
    let sqlquery = "INSERT INTO books (name, price) VALUES (?,?)";
    // Sanitize the book name to prevent XSS
    let newrecord = [req.sanitize(req.body.name), req.body.price];
    db.query(sqlquery, newrecord, (err, result) => {
        if (err) {
            next(err);
        }
        else
            res.send(' This book is added to database, name: '+ req.sanitize(req.body.name) + ' price '+ req.body.price);
    });
});

// Route for bargain books - PUBLIC
router.get('/bargainbooks', function(req, res, next) {
    let sqlquery = "SELECT * FROM books WHERE price < 20";
    db.query(sqlquery, (err, result) => {
        if (err) {
            next(err);
        }
        res.render("list.ejs", {availableBooks:result});
    });
});

// Route to display search form - PUBLIC
router.get('/search', function(req, res, next) {
    res.render("search.ejs");
});

// Route to handle search results - PUBLIC
router.get('/search-result', function(req, res, next) {
    let sqlquery = "SELECT * FROM books WHERE name LIKE ?";
    let searchTerm = "%" + req.query.keyword + "%";
    
    db.query(sqlquery, [searchTerm], (err, result) => {
        if (err) {
            next(err);
        }
        res.render("list.ejs", {availableBooks:result});
    });
});

module.exports = router;