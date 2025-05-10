const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../middleware/auth');

// Home page route
router.get('/', (req, res) => {
  res.render('index', {
    title: 'Cricket Bat Management',
    user: req.user
  });
});

// Dashboard route (protected)
router.get('/dashboard', ensureAuthenticated, (req, res) => {
  res.render('dashboard', {
    title: 'Dashboard',
    name: req.user.name
  });
});

module.exports = router;