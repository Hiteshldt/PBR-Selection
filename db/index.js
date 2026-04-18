const { createClient } = require('@libsql/client');

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url) {
  throw new Error('TURSO_DATABASE_URL env var is required');
}

const client = createClient({
  url,
  authToken,
  intMode: 'number',
});

async function get(sql, args = []) {
  const r = await client.execute({ sql, args });
  return r.rows[0];
}

async function all(sql, args = []) {
  const r = await client.execute({ sql, args });
  return r.rows;
}

async function run(sql, args = []) {
  const r = await client.execute({ sql, args });
  return {
    changes: r.rowsAffected,
    lastInsertRowid: r.lastInsertRowid != null ? Number(r.lastInsertRowid) : 0,
  };
}

module.exports = { client, get, all, run };
