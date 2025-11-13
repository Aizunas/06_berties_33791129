const express = require("express");
const router = express.Router();

// Route: List all books
router.get('/list', function(req, res, next) {
    let sqlquery = "SELECT * FROM books";
    db.query(sqlquery, (err, result) => {
        if (err) {
            console.error(err);
            next(err);
        } else {
            res.render("list.ejs", { availableBooks: result });
        }
    });
});

// Route: Add Book form
router.get('/addbook', function(req, res, next) {
    res.render("addbook.ejs");
});

// Route: Handle Add Book form submission
router.post('/bookadded', function (req, res, next) {
    let sqlquery = "INSERT INTO books (name, price) VALUES (?, ?)";
    let newrecord = [req.body.name, req.body.price];
    db.query(sqlquery, newrecord, (err, result) => {
        if (err) {
            console.error(err);
            next(err);
        } else {
            res.send('This book is added to the database. Name: '+ req.body.name + ', Price: £'+ req.body.price);
        }
    });
});

// Route: Bargain books (price < £20)
router.get('/bargainbooks', function(req, res, next) {
    let sqlquery = "SELECT name, price FROM books WHERE price < 20";
    db.query(sqlquery, (err, result) => {
        if (err) {
            next(err);
        } else {
            res.render("list.ejs", { availableBooks: result });
        }
    });
});

// Route: Search page (form)
router.get('/search', function(req, res, next){
    res.render("search.ejs"); // this page contains the input form
});

// Route: Handle search query (supports advanced partial match)
router.get('/search-result', function(req, res, next) {
    let keyword = req.query.keyword;
    if (!keyword) {
        // If empty, just return no results or redirect back
        return res.render("list.ejs", { availableBooks: [] });
    }
    
    // Advanced search using LIKE (partial match)
    let sqlquery = "SELECT name, price FROM books WHERE name LIKE ?";
    let searchTerm = '%' + keyword + '%';

    db.query(sqlquery, [searchTerm], (err, result) => {
        if (err) {
            next(err);
        } else {
            res.render("list.ejs", { availableBooks: result });
        }
    });
});

module.exports = router;
