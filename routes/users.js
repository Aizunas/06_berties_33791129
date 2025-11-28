// Create a new router
const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt"); // Import bcrypt for password hashing
const saltRounds = 10;

const redirectLogin = (req, res, next) => {
    if (!req.session.userId) {
        return res.redirect('/users/login');  // must be logged in
    }
    next();
};

// Render registration form
router.get('/register', function (req, res, next) {
    res.render('register.ejs');
});

// Handle registration form submission
router.post('/registered', function (req, res, next) {
    const { username, first, last, email, password } = req.body;

    // Hash the password before storing
    bcrypt.hash(password, saltRounds, function(err, hashedPassword) {
        if (err) {
            console.error(err);
            return res.send("Error hashing password.");
        }

        // Save user data to database
        const sql = 'INSERT INTO users (username, first_name, last_name, email, hashed_password) VALUES (?, ?, ?, ?, ?)';
        db.query(sql, [username, first, last, email, hashedPassword], (err, result) => {
            if (err) {
                console.error(err);
                return res.send("Error inserting user into DB.");
            }

            let output = `Hello ${first} ${last}, you are now registered! We will send an email to ${email}. `;
            output += `Your password is: ${password} and your hashed password is: ${hashedPassword}`;
            res.send(output);
        });
    });
});

// Route: List all users (without passwords)
router.get('/list', redirectLogin, function(req, res, next) {
    const sqlquery = "SELECT id, username, first_name, last_name, email FROM users";
    db.query(sqlquery, (err, result) => {
        if (err) {
            console.error(err);
            next(err);
        } else {
            res.render("listusers.ejs", { users: result });
        }
    });
});

// Render login form
router.get('/login', (req, res) => {
    res.render('login.ejs'); // the form you just created
});

// Handle login submission
router.post('/loggedin', function(req, res, next) {
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

        bcrypt.compare(password, hashedPassword, function(err, match) {
            if (err) {
                console.error(err);
                return res.send("Error comparing passwords.");
            }

            const successFlag = match ? 1 : 0;

            db.query("INSERT INTO login_audit (username, success) VALUES (?, ?)", [username, successFlag]);

            if (match) {
            
                req.session.userId = username;
                req.session.displayName = `${firstName} ${lastName}`;

                return res.send(`Login successful! Welcome, ${firstName} ${lastName}.`);
            } else {
                return res.send("Login failed: incorrect password.");
            }
        });
    });
});

router.get('/audit', redirectLogin, function(req, res, next) {
    const sql = "SELECT username, success, timestamp FROM login_audit ORDER BY timestamp DESC";
    db.query(sql, (err, results) => {
        if (err) return next(err);

        res.render("audit.ejs", { logs: results });
    });
});


// Export the router object so index.js can access it
module.exports = router;
