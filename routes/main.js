const express = require('express');
const router = express.Router();

// Middleware to protect routes
const redirectLogin = (req, res, next) => {
    if (!req.session.userId) return res.redirect('./login');
    next();
};

// Home page
router.get('/', (req, res) => res.render('index'));

// Logout
router.get('/logout', redirectLogin, (req, res) => {
    req.session.destroy(err => {
        if (err) return res.redirect('/');
        res.send("You are now logged out. <a href='/'>Home</a>");
    });
});

module.exports = router;
