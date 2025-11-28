const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { check, validationResult } = require('express-validator');

const saltRounds = 10;

// Middleware to protect routes
const redirectLogin = (req, res, next) => {
    if (!req.session.userId) return res.redirect('./login');
    next();
};

// ---------------------------
// Registration Routes
// ---------------------------

// Render registration form
router.get('/register', (req, res) => {
    res.render('register', { errors: [] });
});

// Handle registration submission
router.post('/registered',
    [
        check('email').isEmail().withMessage('Invalid email address'),
        check('username').isLength({ min: 5, max: 20 }).withMessage('Username must be 5-20 chars'),
        check('password').isLength({ min: 8 }).withMessage('Password must be at least 8 chars')
    ],
    (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.render('register', { errors: errors.array() });
        }

        // Sanitize inputs
        const first = req.sanitize(req.body.first);
        const last = req.sanitize(req.body.last);
        const username = req.sanitize(req.body.username);
        const email = req.sanitize(req.body.email);
        const password = req.body.password; // hashed later

        bcrypt.hash(password, saltRounds, (err, hashedPassword) => {
            if (err) return res.send("Error hashing password");

            const sql = 'INSERT INTO users (username, first_name, last_name, email, hashed_password) VALUES (?, ?, ?, ?, ?)';
            db.query(sql, [username, first, last, email, hashedPassword], (err) => {
                if (err) return res.send("Database insert error");
                res.send(`Hello ${first} ${last}, you are now registered! <a href='/users/login'>Login</a>`);
            });
        });
    }
);

// ---------------------------
// Login Routes
// ---------------------------

router.get('/login', (req, res) => res.render('login'));

router.post('/loggedin', (req, res) => {
    const { username, password } = req.body;

    const sql = "SELECT hashed_password, first_name, last_name FROM users WHERE username=?";
    db.query(sql, [username], (err, results) => {
        if (err) return res.send("Database error.");
        if (results.length === 0) {
            db.query("INSERT INTO login_audit (username, success) VALUES (?, ?)", [username, 0]);
            return res.send("Login failed: username not found.");
        }

        const hashedPassword = results[0].hashed_password;
        const firstName = results[0].first_name;
        const lastName = results[0].last_name;

        bcrypt.compare(password, hashedPassword, (err, match) => {
            if (err) return res.send("Error comparing passwords.");

            const successFlag = match ? 1 : 0;
            db.query("INSERT INTO login_audit (username, success) VALUES (?, ?)", [username, successFlag]);

            if (match) {
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

router.get('/list', redirectLogin, (req, res) => {
    db.query("SELECT id, username, first_name, last_name, email FROM users", (err, result) => {
        if (err) return res.send("Error fetching users.");
        res.render("listusers", { users: result });
    });
});

router.get('/audit', redirectLogin, (req, res) => {
    db.query("SELECT username, success, timestamp FROM login_audit ORDER BY timestamp DESC", (err, results) => {
        if (err) return res.send("Error fetching audit logs.");
        res.render("audit", { logs: results });
    });
});

module.exports = router;
