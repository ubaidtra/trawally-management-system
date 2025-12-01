const isAuthenticated = (req, res, next) => {
  if (req.session && req.session.user) {
    return next();
  }
  req.session.error = 'Please log in to access this page';
  res.redirect('/auth/login');
};

const isNotAuthenticated = (req, res, next) => {
  if (req.session && req.session.user) {
    return res.redirect(`/${req.session.user.role}/dashboard`);
  }
  next();
};

module.exports = { isAuthenticated, isNotAuthenticated };

