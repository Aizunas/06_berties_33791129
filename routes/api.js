const express = require('express');
const router = express.Router();
const db = global.db; // using the same database pool from index.js

// GET /api/books
router.get('/books', (req, res, next) => {
    let search = req.query.search;     
    let minPrice = req.query.minprice;  
    let maxPrice = req.query.maxprice;  
    let sort = req.query.sort;         

    let sqlQuery = "SELECT * FROM books";
    let params = [];

    if (search) {
        sqlQuery += " WHERE title LIKE ?";
        params.push('%' + search + '%');
    }

    // Add price range filter if provided
    if (minPrice && maxPrice) {
        if (search) {
            sqlQuery += " AND price BETWEEN ? AND ?";
        } else {
            sqlQuery += " WHERE price BETWEEN ? AND ?";
        }
        params.push(minPrice, maxPrice);
    }

    // Add sorting if provided
    if (sort === 'name') sqlQuery += " ORDER BY title";
    else if (sort === 'price') sqlQuery += " ORDER BY price";

    db.query(sqlQuery, params, (err, result) => {
        if (err) {
            res.json({ error: err });
            next(err);
        } else {
            res.json(result);
        }
    });
});


module.exports = router;

