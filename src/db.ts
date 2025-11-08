import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
    user: 'user_name',
    host: 'localhost',
    database: 'db_name',
    password: 'db_password',
    port: 5432,
});

export default pool;
