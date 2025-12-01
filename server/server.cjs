require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('./db.cjs');

const nodemailer = require('nodemailer');
const crypto = require('crypto');

const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 3001;
const SECRET_KEY = process.env.SECRET_KEY || 'default-secret-key';

// Security Middleware
// Security Middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'", "https://static.cloudflareinsights.com"],
            connectSrc: ["'self'", "http://localhost:3001", process.env.FRONTEND_URL, "https://static.cloudflareinsights.com"],
            imgSrc: ["'self'", "data:", "https:"],
            styleSrc: ["'self'", "'unsafe-inline'", "https:"],
        },
    },
}));

// Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Email Transporter (Configure with your SMTP details)
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL_HOST_USER,
        pass: process.env.EMAIL_HOST_PASSWORD
    }
});

app.use(cors());
app.use(express.json());

// Middleware to verify token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.sendStatus(401);

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

// Auth Routes
app.post('/api/register', async (req, res) => {
    const { name, email, password } = req.body;
    const hashedPassword = bcrypt.hashSync(password, 8);
    const verificationToken = crypto.randomBytes(32).toString('hex');

    try {
        await db.query(
            `INSERT INTO users (name, email, password, verification_token, is_verified) VALUES ($1, $2, $3, $4, $5)`,
            [name, email, hashedPassword, verificationToken, 0]
        );

        const verificationLink = `${process.env.FRONTEND_URL}/verify?token=${verificationToken}`;
        console.log(`Verification Link for ${email}: ${verificationLink}`);

        const mailOptions = {
            from: process.env.EMAIL_HOST_USER,
            to: email,
            subject: 'Verify your email',
            text: `Please verify your email by clicking the following link: ${verificationLink}`
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log('Error sending email:', error);
            } else {
                console.log('Email sent: ' + info.response);
            }
        });

        res.json({ message: 'Registration successful. Please check your email to verify your account.' });
    } catch (err) {
        if (err.code === '23505') { // Unique violation
            return res.status(400).json({ error: 'Email already exists' });
        }
        return res.status(500).json({ error: err.message });
    }
});

app.post('/api/verify', async (req, res) => {
    const { token } = req.body;
    try {
        const result = await db.query(`SELECT * FROM users WHERE verification_token = $1`, [token]);
        const user = result.rows[0];

        if (!user) return res.status(400).json({ error: 'Invalid or expired token' });

        await db.query(`UPDATE users SET is_verified = 1, verification_token = NULL WHERE id = $1`, [user.id]);
        res.json({ message: 'Email verified successfully' });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const result = await db.query(`SELECT * FROM users WHERE email = $1`, [email]);
        const user = result.rows[0];

        if (!user) return res.status(400).json({ error: 'User not found' });

        const validPassword = bcrypt.compareSync(password, user.password);
        if (!validPassword) return res.status(400).json({ error: 'Invalid password' });

        if (!user.is_verified) {
            return res.status(403).json({ error: 'Please verify your email before logging in.' });
        }

        const token = jwt.sign({ id: user.id, email: user.email }, SECRET_KEY, { expiresIn: '24h' });
        res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

app.post('/api/forgot-password', async (req, res) => {
    const { email } = req.body;
    try {
        const result = await db.query(`SELECT * FROM users WHERE email = $1`, [email]);
        const user = result.rows[0];

        if (!user) return res.status(400).json({ error: 'User not found' });

        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetExpires = Date.now() + 3600000; // 1 hour

        await db.query(
            `UPDATE users SET reset_password_token = $1, reset_password_expires = $2 WHERE id = $3`,
            [resetToken, resetExpires, user.id]
        );

        const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
        console.log(`Reset Link for ${email}: ${resetLink}`);

        const mailOptions = {
            from: process.env.EMAIL_HOST_USER,
            to: email,
            subject: 'Password Reset Request',
            text: `You requested a password reset. Click the link to reset your password: ${resetLink}`
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log('Error sending email:', error);
            } else {
                console.log('Email sent: ' + info.response);
            }
        });

        res.json({ message: 'Password reset link sent to your email.' });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

app.post('/api/reset-password', async (req, res) => {
    const { token, newPassword } = req.body;
    try {
        const result = await db.query(
            `SELECT * FROM users WHERE reset_password_token = $1 AND reset_password_expires > $2`,
            [token, Date.now()]
        );
        const user = result.rows[0];

        if (!user) return res.status(400).json({ error: 'Invalid or expired token' });

        const hashedPassword = bcrypt.hashSync(newPassword, 8);

        await db.query(
            `UPDATE users SET password = $1, reset_password_token = NULL, reset_password_expires = NULL WHERE id = $2`,
            [hashedPassword, user.id]
        );

        res.json({ message: 'Password reset successfully' });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

// Expenses Routes
app.get('/api/expenses', authenticateToken, async (req, res) => {
    try {
        const result = await db.query(`SELECT * FROM expenses WHERE user_id = $1 ORDER BY date DESC`, [req.user.id]);
        res.json(result.rows);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

app.post('/api/expenses', authenticateToken, async (req, res) => {
    const { title, amount, category, date } = req.body;
    try {
        const result = await db.query(
            `INSERT INTO expenses (user_id, title, amount, category, date) VALUES ($1, $2, $3, $4, $5) RETURNING id`,
            [req.user.id, title, amount, category, date]
        );
        res.json({ id: result.rows[0].id, title, amount, category, date });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

app.delete('/api/expenses/:id', authenticateToken, async (req, res) => {
    try {
        const result = await db.query(`DELETE FROM expenses WHERE id = $1 AND user_id = $2`, [req.params.id, req.user.id]);
        res.json({ message: 'Deleted', rowCount: result.rowCount });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

// Income Routes
app.get('/api/income', authenticateToken, async (req, res) => {
    try {
        const result = await db.query(`SELECT * FROM income WHERE user_id = $1 ORDER BY date DESC`, [req.user.id]);
        res.json(result.rows);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

app.post('/api/income', authenticateToken, async (req, res) => {
    const { title, amount, category, date } = req.body;
    try {
        const result = await db.query(
            `INSERT INTO income (user_id, title, amount, category, date) VALUES ($1, $2, $3, $4, $5) RETURNING id`,
            [req.user.id, title, amount, category, date]
        );
        res.json({ id: result.rows[0].id, title, amount, category, date });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

app.delete('/api/income/:id', authenticateToken, async (req, res) => {
    try {
        const result = await db.query(`DELETE FROM income WHERE id = $1 AND user_id = $2`, [req.params.id, req.user.id]);
        res.json({ message: 'Deleted', rowCount: result.rowCount });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

// Shopping List Routes
app.get('/api/shopping', authenticateToken, async (req, res) => {
    try {
        const result = await db.query(`SELECT * FROM shopping_items WHERE user_id = $1 ORDER BY created_at DESC`, [req.user.id]);
        res.json(result.rows);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

app.post('/api/shopping', authenticateToken, async (req, res) => {
    const { name, price } = req.body;
    try {
        const result = await db.query(
            `INSERT INTO shopping_items (user_id, name, price) VALUES ($1, $2, $3) RETURNING id`,
            [req.user.id, name, price]
        );
        res.json({ id: result.rows[0].id, name, price, purchased: 0 });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

app.put('/api/shopping/:id', authenticateToken, async (req, res) => {
    const { purchased } = req.body;
    try {
        const result = await db.query(
            `UPDATE shopping_items SET purchased = $1 WHERE id = $2 AND user_id = $3`,
            [purchased ? 1 : 0, req.params.id, req.user.id]
        );
        res.json({ message: 'Updated', rowCount: result.rowCount });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

app.delete('/api/shopping/:id', authenticateToken, async (req, res) => {
    try {
        const result = await db.query(`DELETE FROM shopping_items WHERE id = $1 AND user_id = $2`, [req.params.id, req.user.id]);
        res.json({ message: 'Deleted', rowCount: result.rowCount });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

// Users Management (Admin only)
const authorizeAdmin = async (req, res, next) => {
    try {
        const result = await db.query(`SELECT role FROM users WHERE id = $1`, [req.user.id]);
        const user = result.rows[0];
        if (!user || user.role !== 'Admin') {
            return res.status(403).json({ error: 'Access denied. Admins only.' });
        }
        next();
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

app.get('/api/users', authenticateToken, authorizeAdmin, async (req, res) => {
    try {
        const result = await db.query(`SELECT id, name, email, role, status FROM users`);
        res.json(result.rows);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

app.put('/api/users/:id', authenticateToken, authorizeAdmin, async (req, res) => {
    const { role, status } = req.body;
    try {
        const result = await db.query(
            `UPDATE users SET role = $1, status = $2 WHERE id = $3`,
            [role, status, req.params.id]
        );
        res.json({ message: 'User updated', rowCount: result.rowCount });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

const path = require('path');

// ... (existing code)

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../dist')));

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get(/(.*)/, (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
