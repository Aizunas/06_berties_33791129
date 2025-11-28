const express = require('express');
const router = express.Router();

// Middleware to protect routes (redirects to login if not logged in)
const redirectLogin = (req, res, next) => {
    if (!req.session.userId) {
        return res.redirect('./login');
    }
    next();
};

// ---------------------------
// Public Routes
// ---------------------------

// Home page (accessible to everyone)
router.get('/', (req, res) => {
    res.render('index.ejs');
});

// ---------------------------
// Logout Route
// ---------------------------

// Logout (only accessible to logged-in users)
router.get('/logout', redirectLogin, (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.redirect('/');
        }
        res.send("You are now logged out. <a href='/'>Home</a>");
    });
});

// Export the router
module.exports = router;
