const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const mysql = require('mysql2');
const cors = require('cors');


const app = express();
app.use(bodyParser.json());

// Middleware
app.use(express.json());
app.use(cors()); // Enable CORS for all routes

// MySQL Connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Pvrk@2005',
    database: 'user_auth',
});

db.connect(err => {
    if (err) throw err;
    console.log('Connected to MySQL Database');
});

// Secret key for JWT
const SECRET_KEY = '142546524tugdsbijdshf3747fshdfkgk';

// Registration Route
app.post('/register', async (req, res) => {
    const { username, email, password } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const sql = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';
        db.query(sql, [username, email, hashedPassword], (err, result) => {
            if (err) {
                if (err.code === 'ER_DUP_ENTRY') {
                    return res.status(400).json({ message: 'Email already exists' });
                }
                return res.status(500).json({ message: 'Database error' });
            }
            res.status(201).json({ message: 'User registered successfully' });
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Login Route
app.post('/login', (req, res) => {
    const { email, password } = req.body;

    const sql = 'SELECT * FROM users WHERE email = ?';
    db.query(sql, [email], async (err, results) => {
        if (err) return res.status(500).json({ message: 'Database error' });

        if (results.length === 0) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const user = results[0];
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const token = jwt.sign({ id: user.id, email: user.email }, SECRET_KEY, { expiresIn: '1h' });
        res.status(200).json({ message: 'Login successful', token });
        
    });
});

// Forgot Password Route
app.post('/forgot-password', (req, res) => {
    const { email } = req.body;
    const resetToken = jwt.sign({ email }, SECRET_KEY, { expiresIn: '15m' });
    const tokenExpiration = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    const sql = 'UPDATE users SET reset_token = ?, token_expiration = ? WHERE email = ?';
    db.query(sql, [resetToken, tokenExpiration, email], async (err, result) => {
        if (err) return res.status(500).json({ message: 'Database error' });

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Email not found' });
        }

        // Send reset email
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'pvramakrishna922@gmail.com',
                pass: 'ffcc dcpq ppwd gvox',
            },
        });

        const mailOptions = {
            from: 'pvramakrishna922@gmail.com',
            to: email,
            subject: 'Password Reset Link',
            text: `Use this token to reset your password: ${resetToken}`,
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) return res.status(500).json({ message: 'Email error' });
            res.status(200).json({ message: 'Password reset email sent' });
        });
    });
});

// Password Reset Route
app.post('/reset-password', async (req, res) => {
    const { resetToken, newPassword } = req.body;

    try {
        const decoded = jwt.verify(resetToken, SECRET_KEY);

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        const sql = 'UPDATE users SET password = ?, reset_token = NULL, token_expiration = NULL WHERE email = ?';
        db.query(sql, [hashedPassword, decoded.email], (err, result) => {
            if (err) return res.status(500).json({ message: 'Database error' });

            if (result.affectedRows === 0) {
                return res.status(400).json({ message: 'Invalid or expired token' });
            }

            res.status(200).json({ message: 'Password reset successfully' });
        });
    } catch (error) {
        res.status(400).json({ message: 'Invalid or expired token' });
    }
});

//registration server.js

// POST /submit - Save or update form data
// Submit Form Route
app.post('/submit', (req, res) => {
    const { email, name, age, height, currentWeight, goalWeight, gender, goalType, duration, targetCalories } = req.body;

    // Validate input data
    if (!email || !name || !age || !height || !currentWeight || !goalWeight || !gender || !goalType || !duration || !targetCalories) {
        return res.status(400).json({ success: false, message: 'All fields are required.' });
    }

    // Check if the email is already registered in the database (using a SELECT query)
    const checkQuery = 'SELECT * FROM diet_plan1 WHERE email = ?';
    db.query(checkQuery, [email], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ success: false, message: 'Database error.' });
        }

        if (results.length > 0) {
            // If email already exists, alert the user that they cannot submit again with the same email
            return res.status(400).json({
                success: false,
                message: 'This email is already registered. You cannot submit the form again.'
            });
        }

        // If email does not exist, proceed with form submission
        const insertQuery = `
            INSERT INTO diet_plan1 (email, name, age, height, currentWeight, goalWeight, gender, goalType, duration, targetCalories)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        db.query(insertQuery, [
            email, name, age, height, currentWeight, goalWeight, gender, goalType, duration, targetCalories
        ], (err) => {
            if (err) {
                console.error('Error saving data:', err);
                return res.status(500).json({ success: false, message: 'Error saving data to the database.' });
            }
            res.json({ success: true, message: 'Data saved successfully.' });
        });
    });
});


// GET /fetch - Retrieve data by email
app.get('/fetch', (req, res) => {
    const email = req.query.email;

    // Validate email
    if (!email) {
        return res.status(400).json({ success: false, message: 'Email is required.' });
    }

    const query = 'SELECT * FROM diet_plan WHERE email = ?';
    db.query(query, [email], (err, results) => {
        if (err) {
            console.error('Error fetching data:', err);
            return res.status(500).json({ success: false, message: 'Database error.' });
        }

        if (results.length > 0) {
            res.json({ success: true, data: results[0] });
        } else {
            res.json({ success: false, message: 'No data found for this email.' });
        }
    });
});

// app.delete('/reset', (req, res) => {
//     const email = req.query.email;

//     if (!email) {
//         return res.status(400).json({ success: false, message: 'Email is required to reset data.' });
//     }

//     console.log('Received email to delete:', email);

//     const query = 'DELETE FROM diet_plan1 WHERE TRIM(LOWER(email)) = TRIM(LOWER(?))';

//     db.query(query, [email], (err, results) => {
//         if (err) {
//             console.error('Error deleting data:', err);
//             return res.status(500).json({ success: false, message: 'Database error.' });
//         }

//         console.log('Query executed:', query);
//         console.log('Results:', results);

//         if (results && results.affectedRows > 0) {
//             return res.json({ success: true, message: 'Data successfully reset.' });
//         } else {
//             return res.status(404).json({ success: false, message: 'Email not found in database.' });
//         }
//     });
// });

app.delete('/reset', (req, res) => {
    const email = req.query.email;

    if (!email) {
        return res.status(400).json({ success: false, message: 'Email is required to reset data.' });
    }

    console.log('Received email to delete:', email);

    // First query - Delete from diet_plan1
    const query1 = 'DELETE FROM diet_plan1 WHERE TRIM(LOWER(email)) = TRIM(LOWER(?))';

    db.query(query1, [email], (err, results) => {
        if (err) {
            console.error('Error deleting from diet_plan1:', err);
            return res.status(500).json({ success: false, message: 'Database error.' });
        }

        console.log('Query1 executed:', query1);
        console.log('Query1 Results:', results);

        // Check if rows were affected in the first query
        if (results && results.affectedRows > 0) {
            console.log('Data deleted from diet_plan1');

            // Second query - Assuming you want to delete data from another table
            const query2 = 'DELETE FROM calorielog WHERE TRIM(LOWER(email)) = TRIM(LOWER(?))';

            db.query(query2, [email], (err2, results2) => {
                if (err2) {
                    console.error('Error deleting from calorielog:', err2);
                    return res.status(500).json({ success: false, message: 'Database error.' });
                }

                console.log('Query2 executed:', query2);
                console.log('Query2 Results:', results2);

                // Check if rows were affected in the second query
                if (results2 && results2.affectedRows > 0) {
                    return res.json({ success: true, message: 'Data successfully reset in both tables.' });
                } else {
                    return res.status(404).json({ success: false, message: 'Data reset complete.' });
                }
            });

        } else {
            return res.status(404).json({ success: false, message: 'Email not found in diet_plan1.' });
        }
    });
});



// Check Email Existence Route
app.get('/check-email', (req, res) => {
    const { email } = req.query;

    const sql = 'SELECT * FROM diet_plan1 WHERE email = ?';
    db.query(sql, [email], (err, results) => {
        if (err) return res.status(500).json({ message: 'Database error' });

        if (results.length > 0) {
            return res.status(200).json({ exists: true }); // Email exists
        } else {
            return res.status(200).json({ exists: false }); // Email doesn't exist
        }
    });
});

//track page details function

// Endpoint to fetch user data by email
app.get('/get-user', (req, res) => {
    const { email } = req.query;
    const sql = 'SELECT * FROM diet_plan1 WHERE email = ?';
    db.query(sql, [email], (err, result) => {
        if (err) {
            res.status(500).json({ success: false, message: 'Failed to fetch data.' });
        } else {
            res.json({ success: true, data: result[0] });
        }
    });
});


//diet plan server.js file

// Connect to the database
db.connect((err) => {
    if (err) {
        console.error('Failed to connect to the database:', err);
        process.exit(1);
    }
    console.log('Connected to MySQL database.');
});

// Route to handle saving data
app.post('/save-data', (req, res) => {


    const {email, date, breakfast_calories, lunch_calories, dinner_calories, selectedItems } = req.body;

    // Ensure required fields are present
    if (!email ||!date || !selectedItems || selectedItems.length === 0) {
        return res.status(400).json({ success: false, message: 'Missing required fields.' });
    }

    // Convert selectedItems to a string for food_items field
    const newFoodItems = selectedItems.map(item => `${item.category}: ${item.name} (${item.calories} cal)`).join(", ");
    const newTotalCalories = breakfast_calories + lunch_calories + dinner_calories;

    // Check if a record exists for the date
    const selectQuery = `SELECT * FROM calorielog WHERE date = ? AND email=?`;
    db.query(selectQuery, [date, email], (err, results) => {
        if (err) {
            console.error('Error checking existing record:', err);
            return res.status(500).json({ success: false, message: 'Error checking existing data.' });
        }

        if (results.length > 0) {
            // Record exists, update the existing entry
            const existingRecord = results[0];
            const updatedFoodItems = existingRecord.food_items 
                ? existingRecord.food_items + ", " + newFoodItems : newFoodItems;

            const updatedTotalCalories = existingRecord.total_calories + newTotalCalories;
            const updatedBreakfastCalories = existingRecord.breakfast_calories + breakfast_calories;
            const updatedLunchCalories = existingRecord.lunch_calories + lunch_calories;
            const updatedDinnerCalories = existingRecord.dinner_calories + dinner_calories;

            const updateQuery = `
                UPDATE calorielog 
                SET food_items = ?, total_calories = ?, 
                    breakfast_calories = ?, lunch_calories = ?, dinner_calories = ?, updatedAt = NOW()
                WHERE date = ? 
            `;

            db.query(updateQuery, 
                [updatedFoodItems, updatedTotalCalories, updatedBreakfastCalories, updatedLunchCalories, updatedDinnerCalories, date], 
                (err, result) => {
                    if (err) {
                        console.error('Error updating data:', err);
                        return res.status(500).json({ success: false, message: 'Error updating data in the database.' });
                    }
                    res.json({ success: true, message: 'Data updated successfully!' });
                });
        } else {
            // No record exists, insert a new entry
            const insertQuery = `
                INSERT INTO calorielog (email, date, food_items, total_calories, breakfast_calories, lunch_calories, dinner_calories)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `;

            db.query(insertQuery, 
                [email, date, newFoodItems, newTotalCalories, breakfast_calories, lunch_calories, dinner_calories], 
                (err, result) => {
                    if (err) {
                        console.error('Error inserting data:', err);
                        return res.status(500).json({ success: false, message: 'Error saving data to the database.' });
                    }
                    res.json({ success: true, message: 'Data saved successfully!' });
                });
        }
    });
});

// Route to handle fetching data for a specific date
app.get('/get-data', (req, res) => {
  const { date } = req.query;
  
  // Check if the date is provided
  if (!date) {
      return res.status(400).json({ success: false, message: 'Date is required.' });
  }

  // SQL query to fetch calorie data for the provided date
  const query = `
      SELECT * FROM calorieLog WHERE date = ? LIMIT 1
  `;

  db.query(query, [date], (err, result) => {
      if (err) {
          console.error('Error fetching data:', err);
          return res.status(500).json({ success: false, message: 'Error fetching data from database.' });
      }
      
      // If data for the date is found, send it back
      if (result.length > 0) {
          const data = result[0];  // Assuming one entry per date
          res.json({
              success: true,
              totalCalories: data.total_calories,
              breakfastCalories: data.breakfast_calories,
              lunchCalories: data.lunch_calories,
              
              dinnerCalories: data.dinner_calories
          });
      } else {
          res.json({
              success: false,
              message: 'No data found for the selected date.'
          });
      }
  });
});

app.get('/get-monthly-data', (req, res) => {
    const { start_date, end_date } = req.query;

    if (!start_date || !end_date) {
        return res.status(400).json({ success: false, message: 'Missing start_date or end_date' });
    }

    // Query to get the total calories for the date range
    const query = `
        SELECT SUM(total_calories) AS totalCalories
        FROM calorieLog
        WHERE date BETWEEN ? AND ?
    `;

    db.query(query, [start_date, end_date], (err, results) => {
        if (err) {
            console.error('Error executing the query:', err);
            return res.status(500).json({ success: false, message: 'Internal server error' });
        }

        const totalCalories = results[0]?.totalCalories || 0; // Default to 0 if no data found
        res.json({ success: true, totalCalories });
    });
});


//to block two sections before login
function requireLogin(req, res, next) {
    if (!req.session || !req.session.user) {
        // User is not logged in
        return res.status(401).json({ success: false, message: 'User not found. Please log in to continue.' });
    }
    next(); // Proceed if the user is logged in
}

module.exports = { requireLogin };

//feedback section in outline page

// Configure Nodemailer
const transporter1 = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'pvramakrishna922@gmail.com',
        pass: 'ilyd jfhu mxyf xjuc'
    }
});

app.post('/feedback', (req, res) => {
    const { email, suggestion } = req.body;

    if (!email || !suggestion) {
        return res.status(400).json({ success: false, message: 'Email and suggestion are required.' });
    }

    const mailOptions = {
        from: email,
        to: 'pvramakrishna922@gmail.com', // Your email
        subject: 'New Feedback Received',
        text: `Suggestion from ${email}:\n\n${suggestion}`
    };

    transporter1.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error sending email:', error);
            return res.status(500).json({ success: false, message: 'Failed to send email.' });
        }
        res.json({ success: true, message: 'Feedback sent successfully!' });
    });
});


app.listen(3000, () => {
    console.log('Server running on port 3000');
});
