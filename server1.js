require('dotenv').config(); // Load environment variables from .env file
const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000; // Use port from environment variables or default to 3000

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files like images, CSS, JS

// MySQL connection using environment variables
const db = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '', // Default for XAMPP is an empty password
    database: process.env.DB_NAME || 'user_auth' // Default database name
});

// Connect to MySQL
db.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
    } else {
        console.log('Connected to MySQL database');
    }
});

// Serve the homepage
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'homepage.html')); // Serve homepage
});

// Serve the signup form
app.get('/signup', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'signup.html'));
});

// Handle signup form submission
app.post('/signup', async (req, res) => {
    const { username, email, password, confirm_password } = req.body;

    // Validate if passwords match
    if (password !== confirm_password) {
        return res.send('Passwords do not match');
    }

    // Check if username already exists
    const checkUserSql = 'SELECT * FROM login_details WHERE username = ?';
    db.query(checkUserSql, [username], async (err, results) => {
        if (err) {
            console.error('Error fetching user data:', err);
            return res.send('Error fetching user data');
        }

        if (results.length > 0) {
            // If user already exists
            return res.send('Username already exists. Please choose another.');
        }

        try {
            // Hash password before storing
            const hashedPassword = await bcrypt.hash(password, 10);

            // Insert new user into the database
            const insertSql = 'INSERT INTO login_details (username, email, password) VALUES (?, ?, ?)';
            db.query(insertSql, [username, email, hashedPassword], (err, result) => {
                if (err) {
                    console.error('Error inserting user data:', err.message);
                    return res.send('Error inserting user data: ' + err.message);
                }
                res.redirect('/'); // Redirect to homepage after successful signup
            });
        } catch (err) {
            console.error('Error hashing password:', err);
            res.send('Error processing signup: ' + err.message);
        }
    });
});

// Serve the login form
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'login.html'));
});

// Handle login form submission
app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    // Query to check if user exists
    const sql = 'SELECT * FROM login_details WHERE username = ?';
    db.query(sql, [username], async (err, results) => {
        if (err) {
            console.error('Error fetching user data:', err);
            return res.send('Error fetching user data');
        }

        // Check if any user is returned
        if (results.length > 0) {
            const user = results[0];
            console.log(`User found: ${JSON.stringify(user)}`);

            try {
                // Compare input password with hashed password in the DB
                const match = await bcrypt.compare(password, user.password);
                if (match) {
                    console.log('Password match');
                    return res.redirect('/without_login'); // Redirect to without_login if login is successful
                } else {
                    console.log('Password does not match');
                    return res.send('Invalid password');
                }
            } catch (bcryptErr) {
                console.error('Error comparing passwords:', bcryptErr);
                return res.send('Error comparing passwords');
            }
        } else {
            console.log('Username not found');
            res.send('Invalid username');
        }
    });
});

// Serve the without_login page
app.get('/without_login', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'without_login.html'));
});

// Serve flight selecting page
app.get('/flight_selecting', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'flight_selecting.html'));
});

// Handle form submission from without_login.html
app.post('/flight_selecting', (req, res) => {
    // Process flight search form data if needed
    res.redirect('/flight_selecting'); // Redirect to flight_selecting.html
});

// Serve the payment page without ".html" in the URL
app.get('/payment', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'payment.html'));
});

// Handle payment form submission
app.post('/payment', (req, res) => {
    // Logic for processing payment goes here...
    
    // After processing payment successfully, redirect to Thankyou_window
    res.redirect('/Thankyou_window'); // Redirect to Thankyou_window
});

// Serve the thank you page
app.get('/Thankyou_window', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'Thankyou_window.html'));
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
