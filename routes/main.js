// Create a new router
const express = require("express");
const router = express.Router();

// Handle our routes
router.get('/', function(req, res, next) {
    res.render('index.ejs', {
        isLoggedIn: req.session.userId ? true : false,
        userId: req.session.userId || null
    });
});

router.get('/about', function(req, res, next) {
    res.render('about.ejs');
});

// Export the router object so index.js can access it
module.exports = router;