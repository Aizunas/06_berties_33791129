const express = require('express');
const router = express.Router();

const BASE_PATH = process.env.BASE_PATH || '';

// Middleware to protect routes
const redirectLogin = (req, res, next) => {
    if (!req.session.userId) return res.redirect(`${BASE_PATH}/users/login`);
    next();
};

// Home page
router.get('/', (req, res) => res.render('index'));

router.get('/about', (req, res) => {
    res.render('about');
});

// Logout
router.get('/logout', redirectLogin, (req, res) => {
    req.session.destroy(err => {
        if (err) return res.redirect('/');
        res.send("You are now logged out. <a href='/'>Home</a>");
    });
});



module.exports = router;
