const checkRole = (...roles) => {
  return (req, res, next) => {
    if (!req.session.user) {
      req.session.error = 'Please log in to access this page';
      return res.redirect('/auth/login');
    }
    
    if (roles.includes(req.session.user.role)) {
      return next();
    }
    
    req.session.error = 'You do not have permission to access this page';
    return res.redirect(`/${req.session.user.role}/dashboard`);
  };
};

module.exports = checkRole;

