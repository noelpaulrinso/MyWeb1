const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const path = require('path');

const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files like images, CSS, JS

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

    try {
        // Hash password before storing (without storing in DB)
        const hashedPassword = await bcrypt.hash(password, 10);
        console.log(`User signed up: ${username}, ${email}, ${hashedPassword}`);
        res.redirect('/'); // Redirect to homepage after "signup"
    } catch (err) {
        console.error('Error hashing password:', err);
        res.send('Error processing signup: ' + err.message);
    }
});

// Serve the login form
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'login.html'));
});

// Handle login form submission
app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    // Simulate a user for login (replace this logic if needed)
    const user = { username: 'testuser', password: '$2b$10$abcd...' }; // A pre-hashed password for test

    try {
        // Compare input password with the test user password
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
