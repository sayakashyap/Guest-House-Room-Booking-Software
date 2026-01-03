const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json()); // For JSON data
app.use(express.urlencoded({ extended: true })); // ✅ NEW: For HTML form data
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/booking', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'booking.html'));
});

// Initialize Database
const db = new sqlite3.Database('./guesthouse.db', (err) => {
  if (err) {
    console.error('❌ Error opening database:', err.message);
  } else {
    console.log('✅ Connected to database!');
    
    // db.run(`CREATE TABLE IF NOT EXISTS bookings (
    //   id INTEGER PRIMARY KEY AUTOINCREMENT,
    //   fullName TEXT NOT NULL,
    //   email TEXT NOT NULL,
    //   phone TEXT NOT NULL,
    //   checkInDate TEXT NOT NULL,
    //   checkOutDate TEXT NOT NULL,
    //   numGuests INTEGER NOT NULL,
    //   numRooms INTEGER NOT NULL,
    //   roomType TEXT,
    //   specialRequests TEXT,
    //   created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    // )`, (err) => {
    //   if (err) {
    //     console.error('❌ Error creating table:', err.message);
    //   } else {
    //     console.log('✅ Bookings table ready!');
    //   }
    // });
  }
});

// ✅ Handle Form Submission
app.post('/api/booking', (req, res) => {
  console.log('\n📨 Received booking:');
  console.log(req.body);
  
  const { fullName, email, phone, checkInDate, checkOutDate, numGuests, numRooms, roomType, specialRequests } = req.body;

  // Validate
  if (!fullName || !email || !phone || !checkInDate || !checkOutDate || !numGuests || !numRooms) {
    return res.status(400).send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Booking Error</title>
        <style>
          body { font-family: Arial; text-align: center; padding: 50px; background: #fee; }
          .container { max-width: 500px; margin: 0 auto; background: white; padding: 40px; border-radius: 10px; }
          h1 { color: #e74c3c; }
          a { display: inline-block; margin-top: 20px; padding: 10px 20px; background: #3498db; color: white; text-decoration: none; border-radius: 5px; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>❌ Booking Failed</h1>
          <p>Please fill all required fields.</p>
          <a href="/booking.html">← Go Back</a>
        </div>
      </body>
      </html>
    `);
  }

  // Save to database
  const sql = `INSERT INTO bookings 
    (fullName, email, phone, checkInDate, checkOutDate, numGuests, numRooms, roomType, specialRequests) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
  
  db.run(sql, [fullName, email, phone, checkInDate, checkOutDate, numGuests, numRooms, roomType, specialRequests], function(err) {
    if (err) {
      console.error('❌ Database error:', err.message);
      return res.status(500).send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Database Error</title>
          <style>
            body { font-family: Arial; text-align: center; padding: 50px; background: #fee; }
            .container { max-width: 500px; margin: 0 auto; background: white; padding: 40px; border-radius: 10px; }
            h1 { color: #e74c3c; }
            a { display: inline-block; margin-top: 20px; padding: 10px 20px; background: #3498db; color: white; text-decoration: none; border-radius: 5px; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>❌ Server Error</h1>
            <p>Failed to save booking. Please try again.</p>
            <a href="/booking.html">← Go Back</a>
          </div>
        </body>
        </html>
      `);
    }
    
    console.log(`✅ Booking saved! ID: ${this.lastID}`);
    
    // Success page
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Booking Confirmed</title>
        <style>
          body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            text-align: center; 
            padding: 50px; 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .container { 
            max-width: 600px; 
            background: white; 
            padding: 50px; 
            border-radius: 20px; 
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
          }
          h1 { color: #27ae60; margin-bottom: 20px; font-size: 36px; }
          .booking-id { 
            background: #e8f8f5; 
            padding: 15px; 
            border-radius: 10px; 
            margin: 20px 0; 
            font-size: 24px;
            font-weight: bold;
            color: #27ae60;
          }
          .details { 
            text-align: left; 
            background: #f8f9fa; 
            padding: 20px; 
            border-radius: 10px; 
            margin: 20px 0; 
          }
          .details p { 
            margin: 10px 0; 
            color: #2c3e50;
            font-size: 16px;
          }
          .details strong { 
            color: #667eea; 
          }
          a { 
            display: inline-block; 
            margin-top: 30px; 
            padding: 15px 30px; 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
            color: white; 
            text-decoration: none; 
            border-radius: 10px; 
            font-weight: 600;
            transition: transform 0.3s;
          }
          a:hover {
            transform: translateY(-2px);
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>✅ Booking Confirmed!</h1>
          <div class="booking-id">Booking ID: #${this.lastID}</div>
          <div class="details">
            <p><strong>Name:</strong> ${fullName}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Phone:</strong> ${phone}</p>
            <p><strong>Check-in:</strong> ${checkInDate}</p>
            <p><strong>Check-out:</strong> ${checkOutDate}</p>
            <p><strong>Guests:</strong> ${numGuests}</p>
            <p><strong>Rooms:</strong> ${numRooms}</p>
            ${roomType ? `<p><strong>Room Type:</strong> ${roomType}</p>` : ''}
            ${specialRequests ? `<p><strong>Special Requests:</strong> ${specialRequests}</p>` : ''}
          </div>
          <p style="color: #666; font-size: 14px;">A confirmation email will be sent to ${email}</p>
          <a href="/booking.html">← Make Another Booking</a>
        </div>
      </body>
      </html>
    `);
  });
});

// Get all bookings (view in browser)
app.get('/api/bookings', (req, res) => {
  const sql = 'SELECT * FROM bookings ORDER BY created_at DESC';
  
  db.all(sql, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Database error' });
    }
    
    res.json({ success: true, count: rows.length, bookings: rows });
  });
});
//start new
app.post('/login', (req, res) => {
    const { email, password } = req.body;
    const query = `SELECT * FROM users WHERE email = ? AND password = ?`;

    db.get(query, [email, password], (err, user) => {
        if (err) return res.status(500).json({ error: "Database error" });
        if (!user) return res.status(401).json({ error: "Invalid credentials" });

        // Simple role check based on your requested users
        const role = (email === 'admin@guest.com') ? 'admin' : 'guest';
        res.json({ email: user.email, role: role });
    });
});

// 2. Admin: Get all bookings
app.get('/api/admin/bookings', (req, res) => {
    db.all("SELECT * FROM bookings", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// 3. Guest: Get specific user bookings
app.get('/api/guest/bookings', (req, res) => {
    const email = req.query.email;
    db.all("SELECT * FROM bookings WHERE email = ?", [email], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server: http://localhost:${PORT}`);
});