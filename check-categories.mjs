import pg from 'pg';
const { Pool } = pg;

const url = new URL('postgresql://postgres.cmuwzuohwnvqhfksxumt:Pratibimba%40%23123@aws-1-ap-southeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true');
const pool = new Pool({
  host: url.hostname,
  port: parseInt(url.port),
  database: url.pathname.slice(1),
  user: url.username,
  password: decodeURIComponent(url.password),
  ssl: { rejectUnauthorized: false },
  max: 1,
  connectionTimeoutMillis: 10000,
});

try {
  const cats = await pool.query('SELECT id, name, slug FROM categories ORDER BY "sortOrder"');
  console.log('Categories:', JSON.stringify(cats.rows, null, 2));
  
  if (cats.rows.length > 0) {
    const svcs = await pool.query('SELECT id, name, slug, "categoryId" FROM services LIMIT 20');
    console.log('\nServices:', JSON.stringify(svcs.rows, null, 2));
  }
} catch (e) {
  console.error('Error:', e.message);
}
await pool.end();
