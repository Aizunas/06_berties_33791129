# Create database script for Berties Books

# Create the database
CREATE DATABASE IF NOT EXISTS berties_books;
USE berties_books;

# Create the books table
CREATE TABLE IF NOT EXISTS books (
    id     INT AUTO_INCREMENT,
    name   VARCHAR(50),
    price  DECIMAL(5, 2),
    PRIMARY KEY(id)
);

# Create the application user
CREATE USER IF NOT EXISTS 'berties_books_app'@'localhost' IDENTIFIED BY 'qwertyuiop';
GRANT ALL PRIVILEGES ON berties_books.* TO 'berties_books_app'@'localhost';

# Create table for storing users (column names match your users.js code)
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    email VARCHAR(100),
    hashed_password VARCHAR(255)
);

# Insert default user 'gold' (password to be hashed in Node.js)
-- When you run your Node.js registration code, you can hash 'smiths' and insert
-- Example Node.js code will handle this hashing; you can leave a placeholder here if needed
-- INSERT INTO users (username, first_name, last_name, email, hashed_password) 
-- VALUES ('gold', 'Gold', 'Smith', 'gold@example.com', '<hashed_password>');
