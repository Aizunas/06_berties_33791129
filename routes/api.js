const express = require("express");
const router = express.Router();

router.get('/books', function(req, res, next) {
    let sqlquery = "SELECT * FROM books";
    
    // Check for search parameter
    if (req.query.search) {
        sqlquery = "SELECT * FROM books WHERE name LIKE ?";
        let searchTerm = "%" + req.query.search + "%";
        db.query(sqlquery, [searchTerm], (err, result) => {
            if (err) {
                res.json(err);
                next(err);
            } else {
                res.json(result);
            }
        });
    } else {
        db.query(sqlquery, (err, result) => {
            if (err) {
                res.json(err);
                next(err);
            } else {
                res.json(result);
            }
        });
    }
});

module.exports = router;