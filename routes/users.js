const express = require("express");
const router = express.Router();
const bcrypt = require('bcrypt');
const saltRounds = 10;
const { check, validationResult } = require('express-validator');

// Middleware to redirect if not logged in
const redirectLogin = (req, res, next) => {
    if (!req.session.userId) {
        req.session.redirectTo = req.originalUrl;
        return res.redirect('/users/login');
    }
    next();
    
}

// Route to display register form
router.get('/register', function(req, res, next) {
    res.render('register.ejs', { 
        errors: [],       // no errors initially
        formData: {}      // empty formData initially
    });
});

// Route to handle registration with validation and sanitization
router.post('/registered',
    [
        check('email').isEmail().withMessage('Please enter a valid email address'),
        check('username').isLength({ min: 5, max: 20 }).withMessage('Username must be 5-20 characters long'),
        check('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
    ],
    function(req, res, next) {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            // Send errors and form data back to the template
            return res.render('register.ejs', { 
                errors: errors.array(),
                formData: req.body
            });
        }

        const plainPassword = req.body.password;

        bcrypt.hash(plainPassword, saltRounds, function(err, hashedPassword) {
            if (err) {
                return next(err);
            }

            let sqlquery = "INSERT INTO users (username, first, last, email, hashedPassword) VALUES (?,?,?,?,?)";

            // Sanitize first and last names
            let newrecord = [
                req.body.username, 
                req.sanitize(req.body.first), 
                req.sanitize(req.body.last), 
                req.body.email, 
                hashedPassword
            ];

            db.query(sqlquery, newrecord, (err, result) => {
                if (err) {
                    return next(err);
                }

                // // Show success message with links
                // let first = req.sanitize(req.body.first);
                // let last = req.sanitize(req.body.last);

                // res.send(`
                //     <h2>Registration Successful!</h2>
                //     <p>Hello ${first} ${last}, you are now registered!</p>
                //     <p>We will send an email to you at ${req.body.email}.</p>
                //     <button onclick="window.location.href='/'">Go to Home Page</button>
                //     <button onclick="window.location.href='/users/login'">Login</button>
                // `);

                // Automatically log in the user
                req.session.userId = req.body.username;

                // Redirect directly to home page
                res.redirect('/');
            });
        });
    }
);


// Route to list all users - PROTECTED
router.get('/list', redirectLogin, function(req, res, next) {
    let sqlquery = "SELECT username, first, last, email FROM users";
    
    db.query(sqlquery, (err, result) => {
        if (err) {
            next(err);
        }
        res.render("userlist.ejs", {availableUsers:result});
    });
});

// Route to display login form
router.get('/login', function(req, res, next) {
    res.render('login.ejs' ); // Pass error as null initially
});


// Route to handle login with audit logging and session

router.post('/loggedin', function(req, res, next) {
    let sqlquery = "SELECT hashedPassword FROM users WHERE username = ?";
    
    db.query(sqlquery, [req.body.username], (err, result) => {
        if (err) {
            return next(err);
        } else if (result.length == 0) {
            let auditQuery = "INSERT INTO audit_log (username, action, success) VALUES (?, 'login', false)";
            db.query(auditQuery, [req.body.username], (err, result) => {
                if (err) console.error(err);
            });
            
            return res.send(`
                <h1>Login failed: user not found</h1>
                <p><a href="/users/login">Back to Login</a></p>
            `);
        } else {
            let hashedPassword = result[0].hashedPassword;
            
            bcrypt.compare(req.body.password, hashedPassword, function(err, result) {
                if (err) return next(err);

                if (result === true) {
                    let auditQuery = "INSERT INTO audit_log (username, action, success) VALUES (?, 'login', true)";
                    db.query(auditQuery, [req.body.username], (err, result) => {
                        if (err) console.error(err);
                    });
                    
                    req.session.userId = req.body.username;

                    // Redirect to originally requested page or home
                    const redirectTo = req.session.redirectTo || '/';
                    delete req.session.redirectTo;
                    return res.redirect(redirectTo);

                } else {
                    let auditQuery = "INSERT INTO audit_log (username, action, success) VALUES (?, 'login', false)";
                    db.query(auditQuery, [req.body.username], (err, result) => {
                        if (err) console.error(err);
                    });
                    
                    return res.send(`
                        <h1>Login failed: incorrect password</h1>
                        <p><a href="/users/login">Back to Login</a></p>
                    `);
                }
            });
        }
    });
});



// Route to logout - PROTECTED
router.get('/logout', redirectLogin, (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.redirect('/');
        }
        res.send('you are now logged out. <a href=' + './login' + '>Login</a>');
    });
});

// Route to view audit log - PROTECTED
router.get('/audit', redirectLogin, function(req, res, next) {
    let sqlquery = "SELECT * FROM audit_log ORDER BY timestamp DESC";
    
    db.query(sqlquery, (err, result) => {
        if (err) {
            next(err);
        }
        res.render("audit.ejs", {auditLog:result});
    });
});

module.exports = router;