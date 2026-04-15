module.exports = function requireAdmin(req, res, next) {
  if (req.session && req.session.adminId) return next();
  if (req.accepts('html') && !req.xhr && !req.path.startsWith('/api/')) {
    return res.redirect('/admin/');
  }
  return res.status(401).json({ error: 'Unauthorized' });
};
