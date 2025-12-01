require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    user: process.env.PG_USER,
    host: process.env.PG_HOST,
    database: process.env.PG_DATABASE,
    password: process.env.PG_PASSWORD,
    port: process.env.PG_PORT,
});

pool.on('error', (err, client) => {
    console.error('Unexpected error on idle client', err);
    process.exit(-1);
});

const initDb = async () => {
    const client = await pool.connect();
    try {
        console.log('Connected to PostgreSQL database.');

        // Users Table
        await client.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                name TEXT,
                email TEXT UNIQUE,
                password TEXT,
                role TEXT DEFAULT 'User',
                status TEXT DEFAULT 'Active',
                is_verified INTEGER DEFAULT 0,
                verification_token TEXT,
                reset_password_token TEXT,
                reset_password_expires BIGINT,
                monthly_salary REAL DEFAULT 0,
                expected_savings REAL DEFAULT 0,
                salary_deposit_day INTEGER DEFAULT 1,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Add columns if they don't exist (Migration)
        await client.query(`
            DO $$
            BEGIN
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='reset_password_token') THEN
                    ALTER TABLE users ADD COLUMN reset_password_token TEXT;
                END IF;
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='reset_password_expires') THEN
                    ALTER TABLE users ADD COLUMN reset_password_expires BIGINT;
                END IF;
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='monthly_salary') THEN
                    ALTER TABLE users ADD COLUMN monthly_salary REAL DEFAULT 0;
                END IF;
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='expected_savings') THEN
                    ALTER TABLE users ADD COLUMN expected_savings REAL DEFAULT 0;
                END IF;
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='salary_deposit_day') THEN
                    ALTER TABLE users ADD COLUMN salary_deposit_day INTEGER DEFAULT 1;
                END IF;
            END
            $$;
        `);

        // Expenses Table
        await client.query(`
            CREATE TABLE IF NOT EXISTS expenses (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                title TEXT,
                amount REAL,
                category TEXT,
                date TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Income Table
        await client.query(`
            CREATE TABLE IF NOT EXISTS income (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                title TEXT,
                amount REAL,
                category TEXT,
                date TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Shopping List Table
        await client.query(`
            CREATE TABLE IF NOT EXISTS shopping_items (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                name TEXT,
                price REAL,
                purchased INTEGER DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

    } catch (err) {
        console.error('Error initializing database:', err);
    } finally {
        client.release();
    }
};

initDb();

module.exports = {
    query: (text, params) => pool.query(text, params),
};
