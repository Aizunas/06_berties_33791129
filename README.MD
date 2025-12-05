###Berties Books - README
Sample code for the Dynamic Web Applications module.
A small online bookshop built with Node.js, Express, EJS and MySQL.
Features

View all books in a formatted list
Add a new book (form submission)
Bargain books page – shows books priced under £20
Simple search with partial name matching
Interactive weather page using OpenWeatherMap (choose any city)
Public JSON API for the book catalogue
User registration and login with password hashing (bcrypt)
Session-based access control (express-session)
Audit log of all login attempts (success/failure)
Server-side validation (express-validator) and sanitization (express-sanitizer)

###Useful Routes
Public routes (no login required)

/ – home page with navigation
/books/list – all books
/books/bargainbooks – books under £20
/books/search – search form and results
/weather – current weather for any city
/api/books – full catalogue in JSON
(supports ?search=keyword, ?minprice=X&maxprice=Y, ?sort=name or ?sort=price)

###Auth routes

/users/register – registration form
/users/login – login form
/users/logout – log out

###Protected routes (login required)

/books/addbook – add a new book form
/users/list – view registered users
/users/audit – view login audit history

###Prerequisites

Node.js (v14 or higher)
MySQL server
npm

###Installation & Running
git clone <your-repo-url>
cd berties-books
npm install

Create a .env file in the project root:

textBB_HOST=localhost
BB_USER=berties_books_app
BB_PASSWORD=qwertyuiop
BB_DATABASE=berties_books
WEATHER_API_KEY=your_openweathermap_key_here
SESSION_SECRET=somerandomstuff

Set up the database:
mysql < create_db.sql
mysql < insert_test_data.sql

Run locally for development:
node index.js

The app listens on port 8000 by default.

###dotenv
Database credentials and the weather API key are loaded from .env using the dotenv package. This keeps sensitive data out of the code and out of GitHub.

###Access Control
express-session manages user sessions. The redirectLogin middleware protects certain routes – users are sent to the login page if they are not logged in.
Protected routes:

/books/addbook and /books/bookadded
/users/list
/users/audit
/users/logout

All other routes are publicly accessible.

###Validation
express-validator is used on:

Registration: valid email, username length 5-20, password ≥8 characters, first/last names required
Login: username and password not empty
Add book: book name required (1-100 chars), price must be a valid number

If validation fails the user is sent back to the form.
Search and read-only routes have no validation – they are safe because they only read data and use parameterized queries.

###Sanitization
express-sanitizer removes HTML/script tags from:

Username, first name, last name, email (registration)
Username (login)
Book name (add book)

These fields are stored in the database and displayed to users, so sanitization prevents stored XSS attacks.
Passwords and price fields are not sanitized (passwords are hashed and never displayed; price is numeric-only).

###Audit Logging
Every login attempt (successful or failed) is recorded in the audit_log table with username, success/failure, IP address and timestamp. The full history can be viewed at /users/audit (login required).

###Weather Integration
The /weather page uses the OpenWeatherMap API. A city can be entered via the form or query string (/weather?city=Manchester). Temperature, feels-like, humidity, wind speed and description are shown in a simple layout.

###API Documentation
textGET /api/books
Returns all books as JSON. Optional query parameters (can be combined):

search=term – partial match on book name
minprice=X / maxprice=Y – price range
sort=name or sort=price – order results

Examples:
text/api/books?search=world
/api/books?minprice=5&maxprice=20&sort=price
