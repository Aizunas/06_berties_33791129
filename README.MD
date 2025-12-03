# Berties Books

Sample code for Dynamic Web Applications module.

Uses node.js with Express and EJS.

To install and run:

npm install
node index.js


## dotenv

This app uses `dotenv` to load database credentials from a `.env` file.
Create a `.env` in the project root with these values:

BB_USER='berties_books_app'
BB_PASSWORD='qwertyuiop'
BB_DATABASE='berties_books'

The `.env` file is excluded from git. 

## Access Control
Routes restricted to logged-in users:
/users/list – list all users
/users/audit – view login audit logs
/books/addbook – add a new book
Routes accessible without login:
/ – home page
/books/list – view all books
/books/bargainbooks – view books under £20
/books/search – search form and results
/users/register – user registration
/users/login – login page

## Berties Books API

### Get all books
GET /api/books

### Search books
GET /api/books?search=keyword

### Price range
GET /api/books?minprice=5&maxprice=10

### Sort results
GET /api/books?sort=name
GET /api/books?sort=price
