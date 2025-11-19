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

// Export the router object so index.js can access it
module.exports = router;
