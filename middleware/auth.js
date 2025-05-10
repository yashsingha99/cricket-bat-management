module.exports = {
    // Ensure the user is authenticated
    ensureAuthenticated: function(req, res, next) {
      if (req.isAuthenticated()) {
        return next();
      }
      req.flash('error_msg', 'Please log in to view this resource');
      res.redirect('/auth/login');
    },
    
    // Ensure the user is not authenticated (for login/register pages)
    ensureNotAuthenticated: function(req, res, next) {
      if (!req.isAuthenticated()) {
        return next();
      }
      res.redirect('/');
    }
  };