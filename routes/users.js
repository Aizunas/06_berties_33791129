// Create a new router
const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt"); // Import bcrypt for password hashing
const saltRounds = 10;

// Render registration form
router.get('/register', function (req, res, next) {
    res.render('register.ejs'); // make sure you have this form
});

// Handle registration form submission
router.post('/registered', function (req, res, next) {
    const { username, first, last, email, password } = req.body;

    // Hash the password before storing
    bcrypt.hash(password, saltRounds, function(err, hashedPassword) {
        if(err) {
            console.error(err);
            return res.send("Error hashing password.");
        }

        // Save user data to database
        const sql = 'INSERT INTO users (username, first_name, last_name, email, hashed_password) VALUES (?, ?, ?, ?, ?)';
        db.query(sql, [username, first, last, email, hashedPassword], (err, result) => {
            if(err) {
                console.error(err);
                return res.send("Error inserting user into DB.");
            }

            // Debugging output (do NOT use in production)
            let output = `Hello ${first} ${last}, you are now registered! We will send an email to ${email}. `;
            output += `Your password is: ${password} and your hashed password is: ${hashedPassword}`;
            res.send(output);
        });
    });
});

// Route: List all users (without passwords)
router.get('/list', function(req, res, next) {
    let sqlquery = "SELECT id, username, first_name, last_name, email FROM users"; // exclude hashed_password
    db.query(sqlquery, (err, result) => {
        if (err) {
            console.error(err);
            next(err);
        } else {
            res.render("listusers.ejs", { users: result }); // render users in a template
        }
    });
});

// Render login form
router.get('/login', (req, res) => {
    res.render('login.ejs'); // the form you just created
});

// Handle login submission
router.post('/loggedin', (req, res) => {
    const { username, password } = req.body;

    // Find the user by username
    const sql = "SELECT * FROM users WHERE username = ?";
    db.query(sql, [username], (err, results) => {
        if (err) {
            console.error(err);
            return res.send("Database error.");
        }

        if (results.length === 0) {
            return res.send("User not found.");
        }

        const user = results[0];
        const hashedPassword = user.hashed_password;

        // Compare entered password with hashed password
        bcrypt.compare(password, hashedPassword, (err, result) => {
            if (err) {
                console.error(err);
                return res.send("Error comparing passwords.");
            }

            if (result === true) {
                res.send(`Login successful! Welcome, ${user.first_name} ${user.last_name}.`);
            } else {
                res.send("Incorrect password.");
            }
        });
    });
});


// Export the router object so index.js can access it
module.exports = router;
