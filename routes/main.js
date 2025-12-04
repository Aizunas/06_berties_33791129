const express = require('express');
const router = express.Router();

// Middleware to protect routes - FIXED
const redirectLogin = (req, res, next) => {
    if (!req.session.userId) {
        // Get basePath from shopData - FIXED
        const basePath = req.app.locals.shopData?.basePath || '';
        return res.redirect(`${basePath}/users/login`);
    }
    next();
};

// Home page
router.get('/', (req, res) => res.render('index'));

router.get('/about', (req, res) => {
    res.render('about');
});

// Logout - FIXED with basePath
router.get('/logout', redirectLogin, (req, res) => {
    req.session.destroy(err => {
        if (err) {
            const basePath = req.app.locals.shopData?.basePath || '';
            return res.redirect(`${basePath}/`);
        }
        const basePath = req.app.locals.shopData?.basePath || '';
        res.send(`You are now logged out. 
            <a href='${basePath}/'>Home</a>`);
    });
});

module.exports = router;