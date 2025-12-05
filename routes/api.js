// const express = require("express");
// const router = express.Router();
// const db = require('../db');

// router.get('/books', function(req, res, next) {
//     let sqlquery = "SELECT * FROM books";
    
//     // Check for search parameter
//     if (req.query.search) {
//         sqlquery = "SELECT * FROM books WHERE name LIKE ?";
//         let searchTerm = "%" + req.query.search + "%";
//         db.query(sqlquery, [searchTerm], (err, result) => {
//             if (err) {
//                 res.json(err);
//                 next(err);
//             } else {
//                 res.json(result);
//             }
//         });
//     } else {
//         db.query(sqlquery, (err, result) => {
//             if (err) {
//                 res.json(err);
//                 next(err);
//             } else {
//                 res.json(result);
//             }
//         });
//     }
// });

// module.exports = router;

const express = require('express');
const router = express.Router();
  // make sure db.js exists and exports connection

// -------------------------------------------
// GET /api/books
// Returns list of all books as JSON
// Supports search, price range, and sorting
// -------------------------------------------

router.get('/books', function (req, res, next) {

    // Read query string parameters
    let search = req.query.search;
    let minprice = req.query.minprice;
    let maxprice = req.query.maxprice;
    let sort = req.query.sort;

    // Base SQL
    let sql = "SELECT * FROM books WHERE 1=1";

    // Optional search
    if (search) {
        sql += ` AND name LIKE '%${search}%'`;
    }

    // Optional price range
    if (minprice && maxprice) {
        sql += ` AND price BETWEEN ${minprice} AND ${maxprice}`;
    }

    // Optional sorting
    if (sort === "name") {
        sql += " ORDER BY name ASC";
    } 
    else if (sort === "price") {
        sql += " ORDER BY price ASC";
    }

    // Execute query
    db.query(sql, (err, result) => {
        if (err) {
            res.json(err);
            return next(err);
        } else {
            res.json(result);
        }
    });
});

module.exports = router;
