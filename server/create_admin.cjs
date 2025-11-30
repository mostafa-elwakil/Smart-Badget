require('dotenv').config();
const db = require('./db.cjs');
const bcrypt = require('bcryptjs');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

const createAdmin = async () => {
    try {
        console.log('--- Create Admin User ---');

        const name = await question('Enter Name: ');
        const email = await question('Enter Email: ');
        const password = await question('Enter Password: ');

        if (!name || !email || !password) {
            console.error('All fields are required.');
            process.exit(1);
        }

        const hashedPassword = bcrypt.hashSync(password, 8);

        // Check if user already exists
        const checkUser = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        if (checkUser.rows.length > 0) {
            console.error('User with this email already exists.');
            process.exit(1);
        }

        // Insert new admin user
        // We set is_verified to 1 (true) and role to 'Admin'
        await db.query(
            `INSERT INTO users (name, email, password, role, status, is_verified) 
             VALUES ($1, $2, $3, 'Admin', 'Active', 1)`,
            [name, email, hashedPassword]
        );

        console.log(`Admin user '${name}' created successfully.`);
    } catch (err) {
        console.error('Error creating admin user:', err.message);
    } finally {
        rl.close();
        // db.cjs doesn't export a close method for the pool, but the process exit will handle it.
        // However, to be clean, we might need to wait a bit or just exit.
        process.exit(0);
    }
};

createAdmin();
