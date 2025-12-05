# Create database script for Berties Books

# Create the database
CREATE DATABASE IF NOT EXISTS berties_books;
USE berties_books;

# Create the books table
CREATE TABLE IF NOT EXISTS books (id INT AUTO_INCREMENT,
    name VARCHAR(50),
    price DECIMAL(5, 2) unsigned,
    PRIMARY KEY(id));

# Create the users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT,
    username VARCHAR(20),
    first VARCHAR(50),
    last VARCHAR(50),
    email VARCHAR(100),
    hashedPassword VARCHAR(255),
    PRIMARY KEY(id)
);

# Create the audit table
CREATE TABLE IF NOT EXISTS audit_log (
    id INT AUTO_INCREMENT,
    username VARCHAR(20),
    action VARCHAR(50),
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    success BOOLEAN,
    PRIMARY KEY(id)
);

# Create the application user
CREATE USER IF NOT EXISTS 'berties_books_app'@'localhost' IDENTIFIED BY 'qwertyuiop';
GRANT ALL PRIVILEGES ON berties_books.* TO 'berties_books_app'@'localhost';