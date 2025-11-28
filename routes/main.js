const express = require('express');
const router = express.Router();

// Add redirectLogin so it can be used in this file
const redirectLogin = (req, res, next) => {
    if (!req.session.userId) {
        return res.redirect('/users/login');
    }
    next();
};

// Home page
router.get('/', function(req, res, next) {
    res.render('index.ejs');
});

// Logout route
router.get('/logout', redirectLogin, (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.redirect('/');
        }
        res.send("You are now logged out. <a href='/'>Home</a>");
    });
});

// Export router
module.exports = router;
