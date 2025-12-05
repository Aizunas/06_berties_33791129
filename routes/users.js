const express = require("express");
const router = express.Router();
const bcrypt = require('bcrypt');
const saltRounds = 10;

const redirectLogin = (req, res, next) => {
    if (!req.session.userId) {
        res.redirect('./login'); // redirect to the login page
    } else {
        next(); // move to the next middleware function
    }
}

// Route to display register form
router.get('/register', function(req, res, next) {
    res.render('register.ejs');
});

// Route to handle registration
router.post('/registered', function(req, res, next) {
    const plainPassword = req.body.password;
    
    // Hash the password
    bcrypt.hash(plainPassword, saltRounds, function(err, hashedPassword) {
        if (err) {
            next(err);
        } else {
            // Store hashed password in database
            let sqlquery = "INSERT INTO users (username, first, last, email, hashedPassword) VALUES (?,?,?,?,?)";
            let newrecord = [req.body.username, req.body.first, req.body.last, req.body.email, hashedPassword];
            
            db.query(sqlquery, newrecord, (err, result) => {
                if (err) {
                    next(err);
                } else {
                    let result = 'Hello ' + req.body.first + ' ' + req.body.last + ' you are now registered! We will send an email to you at ' + req.body.email;
                    result += ' Your password is: ' + req.body.password + ' and your hashed password is: ' + hashedPassword;
                    res.send(result);
                }
            });
        }
    });
});

// Route to list all users
router.get('/list', redirectLogin, function(req, res, next) {
    let sqlquery = "SELECT username, first, last, email FROM users"; // Don't select passwords!
    
    db.query(sqlquery, (err, result) => {
        if (err) {
            next(err);
        }
        res.render("userlist.ejs", {availableUsers:result});
    });
});

// Route to display login form
router.get('/login', function(req, res, next) {
    res.render('login.ejs');
});

// Route to handle login
router.post('/loggedin', function(req, res, next) {
    // Get the hashed password for the user from database
    let sqlquery = "SELECT hashedPassword FROM users WHERE username = ?";
    
    db.query(sqlquery, [req.body.username], (err, result) => {
        if (err) {
            next(err);
        } else if (result.length == 0) {
            // Log failed login - user not found
            let auditQuery = "INSERT INTO audit_log (username, action, success) VALUES (?, 'login', false)";
            db.query(auditQuery, [req.body.username], (err, result) => {
                if (err) console.error(err);
            });
            
            res.send('Login failed: user not found');
        } else {
            let hashedPassword = result[0].hashedPassword;
            
            // Compare the password supplied with the password in the database
            bcrypt.compare(req.body.password, hashedPassword, function(err, result) {
                if (err) {
                    next(err);
                } else if (result == true) {
                    // Log successful login
                    let auditQuery = "INSERT INTO audit_log (username, action, success) VALUES (?, 'login', true)";
                    db.query(auditQuery, [req.body.username], (err, result) => {
                        if (err) console.error(err);
                    });

                    // Save user session here, when login is successful
                    req.session.userId = req.body.username;
                    
                    res.send('Login successful! Welcome ' + req.body.username);
                } else {
                    // Log failed login - wrong password
                    let auditQuery = "INSERT INTO audit_log (username, action, success) VALUES (?, 'login', false)";
                    db.query(auditQuery, [req.body.username], (err, result) => {
                        if (err) console.error(err);
                    });
                    
                    res.send('Login failed: incorrect password');
                }
            });
        }
    });
});

// Route to view audit log
router.get('/audit', function(req, res, next) {
    let sqlquery = "SELECT * FROM audit_log ORDER BY timestamp DESC";
    
    db.query(sqlquery, (err, result) => {
        if (err) {
            next(err);
        }
        res.render("audit.ejs", {auditLog:result});
    });
});

// Route to logout
router.get('/logout', redirectLogin, (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.redirect('./');
        }
        res.send('you are now logged out. <a href=' + './' + '>Home</a>');
    });
});

module.exports = router;