const express = require("express");
const router = express.Router();

// Middleware to redirect if not logged in
const redirectLogin = (req, res, next) => {
    if (!req.session.userId) {
        res.redirect('../users/login'); // redirect to the login page
    } else {
        next(); // move to the next middleware function
    }
}

router.get('/list', redirectLogin, function(req, res, next) {
    let sqlquery = "SELECT * FROM books"; // query database to get all the books
    // execute sql query
    db.query(sqlquery, (err, result) => {
        if (err) {
            next(err)
        }
        res.render("list.ejs", {availableBooks:result})
     });
});

router.get('/addbook', redirectLogin, function(req, res, next) {
    res.render('addbook.ejs');
});

router.post('/bookadded', redirectLogin, function (req, res, next) {
    // saving data in database
    let sqlquery = "INSERT INTO books (name, price) VALUES (?,?)";
    // execute sql query
    let newrecord = [req.body.name, req.body.price];
    db.query(sqlquery, newrecord, (err, result) => {
        if (err) {
            next(err)
        }
        else
            res.send(' This book is added to database, name: '+ req.body.name + ' price '+ req.body.price);
    })
});

// Route for bargain books (books under £20)
router.get('/bargainbooks', function(req, res, next) {
    let sqlquery = "SELECT * FROM books WHERE price < 20";
    db.query(sqlquery, (err, result) => {
        if (err) {
            next(err);
        }
        res.render("list.ejs", {availableBooks:result});
    });
});

// Route to display search form
router.get('/search', function(req, res, next) {
    res.render("search.ejs");
});

// Route to handle search results (advanced search with LIKE)
router.get('/search_result', function(req, res, next) {
    // Search for books where name contains the search keyword (partial match)
    let sqlquery = "SELECT * FROM books WHERE name LIKE ?";
    // Use % wildcards for partial matching
    let searchTerm = "%" + req.query.keyword + "%";
    
    db.query(sqlquery, [searchTerm], (err, result) => {
        if (err) {
            next(err);
        }
        res.render("list.ejs", {availableBooks:result});
    });
});

module.exports = router;