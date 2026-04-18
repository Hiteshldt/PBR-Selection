require('dotenv').config();
const express = require('express');
const path = require('path');
const cookieSession = require('cookie-session');

const publicRoutes = require('./routes/public');
const adminRoutes = require('./routes/admin');

const app = express();

app.set('trust proxy', 1);
app.use(express.json({ limit: '1mb' }));
app.use(cookieSession({
  name: 'carbelim_sess',
  keys: [process.env.SESSION_SECRET || 'dev-secret-change-me'],
  maxAge: 12 * 60 * 60 * 1000,
  httpOnly: true,
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
}));

app.use('/api/admin', adminRoutes);
app.use('/api', publicRoutes);

app.use(express.static(path.join(__dirname, 'public')));

app.get(/^\/(?!api|admin|track\.html).*/, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

module.exports = app;

if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Carbelim PBR Configurator running at http://localhost:${PORT}`);
    console.log(`Admin panel: http://localhost:${PORT}/admin/`);
  });
}
