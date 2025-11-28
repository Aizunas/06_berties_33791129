const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt'); // For password hashing
const saltRounds = 10;

// Middleware to protect routes (redirects to login if not logged in)
const redirectLogin = (req, res, next) => {
    if (!req.session.userId) {
        return res.redirect('./login');
    }
    next();
};

// ---------------------------
// Registration Routes
// ---------------------------

// Render registration form
router.get('/register', (req, res) => {
    res.render('register.ejs');
});

// Handle registration form submission
router.post('/registered', (req, res) => {
    const { username, first, last, email, password } = req.body;

    // Hash the password
    bcrypt.hash(password, saltRounds, (err, hashedPassword) => {
        if (err) {
            console.error(err);
            return res.send("Error hashing password.");
        }

        // Save user to database
        const sql = `INSERT INTO users (username, first_name, last_name, email, hashed_password) 
                     VALUES (?, ?, ?, ?, ?)`;
        db.query(sql, [username, first, last, email, hashedPassword], (err, result) => {
            if (err) {
                console.error(err);
                return res.send("Error inserting user into database.");
            }

            res.send(`Hello ${first} ${last}, you are now registered! <a href='/users/login'>Login</a>`);
        });
    });
});

// ---------------------------
// Login Routes
// ---------------------------

// Render login form
router.get('/login', (req, res) => {
    res.render('login.ejs');
});

// Handle login submission
router.post('/loggedin', (req, res) => {
    const { username, password } = req.body;

    const sql = "SELECT hashed_password, first_name, last_name FROM users WHERE username=?";
    db.query(sql, [username], (err, results) => {
        if (err) {
            console.error(err);
            return res.send("Database error.");
        }

        if (results.length === 0) {
            db.query("INSERT INTO login_audit (username, success) VALUES (?, ?)", [username, 0]);
            return res.send("Login failed: username not found.");
        }

        const hashedPassword = results[0].hashed_password;
        const firstName = results[0].first_name;
        const lastName = results[0].last_name;

        bcrypt.compare(password, hashedPassword, (err, match) => {
            if (err) {
                console.error(err);
                return res.send("Error comparing passwords.");
            }

            const successFlag = match ? 1 : 0;
            db.query("INSERT INTO login_audit (username, success) VALUES (?, ?)", [username, successFlag]);

            if (match) {
                // Save session data
                req.session.userId = username;
                req.session.displayName = `${firstName} ${lastName}`;
                res.send(`Login successful! Welcome, ${firstName} ${lastName}. <a href='/users/list'>Go to User List</a>`);
            } else {
                res.send("Login failed: incorrect password.");
            }
        });
    });
});

// ---------------------------
// Protected Routes
// ---------------------------

// List all users (only logged-in users)
router.get('/list', redirectLogin, (req, res) => {
    const sql = "SELECT id, username, first_name, last_name, email FROM users";
    db.query(sql, (err, result) => {
        if (err) return res.send("Error fetching users.");
        res.render("listusers.ejs", { users: result });
    });
});

// Audit logs (only logged-in users)
router.get('/audit', redirectLogin, (req, res) => {
    const sql = "SELECT username, success, timestamp FROM login_audit ORDER BY timestamp DESC";
    db.query(sql, (err, results) => {
        if (err) return res.send("Error fetching audit logs.");
        res.render("audit.ejs", { logs: results });
    });
});

// Export the router
module.exports = router;
