# Insert test data for Berties Books
USE berties_books;

INSERT INTO books (name, price) VALUES
('Brighton Rock', 20.25),
('Brave New World', 25.00),
('Animal Farm', 12.99);

# Insert the gold test user with hashed password 'smiths'
# You'll need to generate this hash by running bcrypt.hash('smiths', 10) first
# For now, register the user through the app, then you can copy the hash here

INSERT INTO users (username, first, last, email, hashedPassword) VALUES 
('gold', 'Gold', 'Smith', 'gold@test.com', '$2b$10$gwN2MpfmvZjMQfwbtTsRROluGJNgEmScT3ru0hFJizHwoFBTV8OKC');
