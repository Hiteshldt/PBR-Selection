require('dotenv').config();
const bcrypt = require('bcryptjs');
const readline = require('readline');
const db = require('./index');

function prompt(question, hidden = false) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    if (hidden) {
      const stdin = process.openStdin();
      process.stdout.write(question);
      let val = '';
      const onData = (ch) => {
        ch = ch.toString();
        if (ch === '\n' || ch === '\r' || ch === '\r\n' || ch === '\u0004') {
          process.stdin.removeListener('data', onData);
          process.stdout.write('\n');
          rl.close();
          resolve(val);
        } else if (ch === '\u0003') {
          process.exit();
        } else {
          val += ch;
        }
      };
      process.stdin.on('data', onData);
    } else {
      rl.question(question, (a) => { rl.close(); resolve(a); });
    }
  });
}

(async () => {
  console.log('\nCarbelim Admin Seed\n===================\n');
  const email = (await prompt('Admin email: ')).trim().toLowerCase();
  const name = (await prompt('Admin name: ')).trim();
  const password = await prompt('Password (min 8 chars): ', true);

  if (!email || !password || password.length < 8) {
    console.error('Invalid input. Email required, password must be 8+ chars.');
    process.exit(1);
  }

  const existing = db.prepare('SELECT id FROM admin_users WHERE email=?').get(email);
  const hash = bcrypt.hashSync(password, 10);
  const now = new Date().toISOString();

  if (existing) {
    db.prepare('UPDATE admin_users SET password_hash=?, name=? WHERE email=?').run(hash, name, email);
    console.log(`\nUpdated existing admin: ${email}`);
  } else {
    db.prepare('INSERT INTO admin_users (email, password_hash, name, created_at) VALUES (?, ?, ?, ?)').run(email, hash, name, now);
    console.log(`\nCreated admin: ${email}`);
  }
  process.exit(0);
})();
