const express = require('express');
const router = express.Router();
const passport = require('passport');
const User = require('../models/User');
const { ensureNotAuthenticated } = require('../middleware/auth');

// Register page
router.get('/register', ensureNotAuthenticated, (req, res) => {
  res.render('auth/register', {
    title: 'Register'
  });
});

// Login page
router.get('/login', ensureNotAuthenticated, (req, res) => {
  res.render('auth/login', {
    title: 'Login'
  });
});

// Register handle
router.post('/register', ensureNotAuthenticated, async (req, res) => {
  const { name, email, password, password2, gender, aadharNumber, age, location } = req.body;
  let errors = [];

  // Check required fields
  if (!name || !email || !password || !password2 || !gender || !aadharNumber || !age || !location) {
    errors.push({ msg: 'Please fill in all fields' });
  }

  // Check passwords match
  if (password !== password2) {
    errors.push({ msg: 'Passwords do not match' });
  }

  // Check password length
  if (password.length < 6) {
    errors.push({ msg: 'Password should be at least 6 characters' });
  }

  if (errors.length > 0) {
    res.render('auth/register', {
      title: 'Register',
      errors,
      name,
      email,
      gender,
      aadharNumber,
      age,
      location
    });
  } else {
    try {
      // Check if user already exists
      const userExists = await User.findOne({ email });
      
      if (userExists) {
        errors.push({ msg: 'Email is already registered' });
        res.render('auth/register', {
          title: 'Register',
          errors,
          name,
          email,
          gender,
          aadharNumber,
          age,
          location
        });
      } else {
        // Create new user
        const newUser = new User({
          name,
          email,
          password,
          gender,
          aadharNumber,
          age,
          address: { location }
        });

        // Save user to database
        await newUser.save();
        req.flash('success_msg', 'You are now registered and can log in');
        res.redirect('/auth/login');
      }
    } catch (err) {
      console.error(err);
      req.flash('error_msg', 'Server error');
      res.redirect('/auth/register');
    }
  }
});

// Login handle
router.post('/login', ensureNotAuthenticated, (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: '/dashboard',
    failureRedirect: '/auth/login',
    failureFlash: true
  })(req, res, next);
});

// Logout handle
router.get('/logout', (req, res) => {
  req.logout(function(err) {
    if (err) { return next(err); }
    req.flash('success_msg', 'You are logged out');
    res.redirect('/auth/login');
  });
});

module.exports = router;