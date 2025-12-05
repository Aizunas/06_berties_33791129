// Create a new router
const express = require("express");
const router = express.Router();

// Handle our routes
router.get('/', function(req, res, next) {
    // Pass shop name (via app.locals) and a simple isLoggedIn flag
    res.render('index.ejs', { 
        isLoggedIn: !!req.session.userId,
        userId: req.session.userId   // true if logged in, false otherwise
    });
});

router.get('/about', function(req, res, next) {
    res.render('about.ejs');
});

// Export the router object so index.js can access it
module.exports = router;