import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import dotenv from "dotenv";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import multer from "multer";
import path from "path";
import fs from "fs";
import cors from 'cors';


dotenv.config();

const app = express();
const port = process.env.PORT || 8080;

const pool = new pg.Pool({
    user: process.env.PGUSER,
    host: process.env.PGHOST,
    database: process.env.PGDATABASE,
    password: process.env.PGPASSWORD,
    port: parseInt(process.env.PGPORT),
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use('/uploads', cors(), express.static('uploads'));
app.use('/avatars', cors(),  express.static('uploads'));



// Multer konfiguráció (fájlok feltöltésére)
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      const dir = `./uploads/${req.user.username}`;
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      cb(null, dir);
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      
      // Ha van `req.body.name`, akkor egy kontaktot töltöttek fel
      if (req.body.name) {
        const safeName = req.body.name.replace(/\s+/g, '_'); // szóközök helyett _
        const timestamp = Date.now();
        cb(null, `${safeName}_${timestamp}${ext}`);
      } else {
        // Ha nincs név, akkor user avatar
        cb(null, `${req.user.username}${ext}`);
      }
    }
  });
  
  const upload = multer({ 
    storage,
    limits: { fileSize: 2 * 1024 * 1024 } // 2 MB méretkorlát
  });


// Middleware a JWT ellenőrzésre
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.sendStatus(401);

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
}

// Hashelő funkció
function hashPassword(password) {
    return crypto.createHash('sha256').update(password).digest('hex');
}

// Login
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Missing username or password' });

    try {
        const result = await pool.query("SELECT * FROM users WHERE users.username = $1", [username]);
        if (result.rowCount === 0) return res.status(400).json({ error: "User not found" });

        const user = result.rows[0];
        const passwordHash = hashPassword(password);
        if (user.password !== passwordHash) return res.status(400).json({ error: "Incorrect password" });

        const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.json({ token, username: username });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});

// Register
app.post('/register', async (req, res) => {
    const { username, password, password2 } = req.body;
    if (!username || !password || !password2) return res.status(400).json({ error: 'Missing fields' });

    if (password !== password2) return res.status(400).json({ error: "Passwords don't match" });

    try {
        const existing = await pool.query("SELECT username FROM users WHERE users.username = $1", [username]);
        if (existing.rowCount > 0) return res.status(400).json({ error: "Username already exists" });

        const passwordHash = hashPassword(password);
        await pool.query("INSERT INTO users (username, password) VALUES ($1, $2)", [username, passwordHash]);

        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});

// Get all contacts
app.get('/contacts', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM contacts WHERE contacts.username = $1 ORDER BY name ASC", [req.user.username]);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});


// Add new contact
app.post('/contacts', authenticateToken, upload.single('avatar'), async (req, res) => {
    const { name, mobile, email, address } = req.body;
    let avatarurl = req.file ? req.file.path : 'uploads/default.jpg';

    if (!name) return res.status(400).json({ error: "Name is required" });

    try {
      console.log(req.body);
      console.log(req.user);


        const result = await pool.query(
            `INSERT INTO contacts (username, name, mobile, email, address, avatarurl) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
            [req.user.username, name, mobile, email, address, avatarurl]
          ); 
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});

// Update contact
app.put('/contacts/:id', authenticateToken, upload.single('avatar'), async (req, res) => {
    const { name, mobile, email, address } = req.body;
    const { id } = req.params;

    let avatarurl = req.file ? req.file.path : undefined;

    try {
        const contact = await pool.query("SELECT * FROM contacts WHERE id = $1 AND username = $2", [id, req.user.username]);
        if (contact.rowCount === 0) return res.status(404).json({ error: "Contact not found" });

        const updatedContact = await pool.query(
            `UPDATE contacts 
             SET name = COALESCE($1, name), 
                 mobile = COALESCE($2, mobile), 
                 email = COALESCE($3, email), 
                 address = COALESCE($7, address), 
                 avatarurl = COALESCE($4, avatarurl) 
             WHERE id = $5 AND username = $6 
             RETURNING *`,
            [name, mobile, email, avatarurl, id, req.user.username, address]
          );
          

        res.json(updatedContact.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});

// Delete contact
app.delete('/contacts/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    // Először lekérjük a kontaktot, hogy tudjuk, van-e képe
    const contactResult = await pool.query(
      "SELECT * FROM contacts WHERE id = $1 AND username = $2",
      [id, req.user.username]
    );

    if (contactResult.rowCount === 0) {
      return res.status(404).json({ error: "Contact not found" });
    }

    const contact = contactResult.rows[0];

    // Ezután töröljük az adatbázisból
    await pool.query("DELETE FROM contacts WHERE id = $1 AND username = $2", [
      id,
      req.user.username,
    ]);

    // Töröljük a fájlt is, ha nem az alapértelmezett kép
    if (
      contact.avatarurl &&
      contact.avatarurl !== "uploads/default.jpg" &&
      fs.existsSync(contact.avatarurl)
    ) {
      fs.unlinkSync(contact.avatarurl);
    }

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});


app.post('/downloadContact', authenticateToken, async (req, res) => {
  const { id, type } = req.body;

  if (!id || !type) return res.status(400).json({ error: "Missing fields" });

  try {
    const result = await pool.query(
      "SELECT * FROM contacts WHERE id = $1 AND username = $2",
      [id, req.user.username]
    );

    if (result.rowCount === 0) return res.status(404).json({ error: "Contact not found" });

    const contact = result.rows[0];
    const avatarUrl = contact.avatarurl ? contact.avatarurl.replace(/\\/g, "/") : null;
    contact.avatarurl = avatarUrl;

    console.log("downloading contact")
    console.log(JSON.stringify(contact));

    if (type === "json") {
      res.setHeader("Content-Disposition", `attachment; filename="${contact.name}.json"`);
      res.setHeader("Content-Type", "application/json");
      res.send(JSON.stringify(contact, null, 2));
    } else if (type === "vcard") {
      const vcard = `
BEGIN:VCARD
VERSION:3.0
FN:${contact.name}
TEL:${contact.mobile}
EMAIL:${contact.email}
ADR:${contact.address}
END:VCARD
      `.trim();

      res.setHeader("Content-Disposition", `attachment; filename="${contact.name}.vcf"`);
      res.setHeader("Content-Type", "text/vcard");
      res.send(vcard);
    } else {
      res.status(400).json({ error: "Invalid type" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});


app.use((err, req, res, next) => {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'A fájl túl nagy. Maximum 2MB engedélyezett.' });
    }
    next(err);
  });


app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
