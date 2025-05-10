const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { ensureAuthenticated } = require('../middleware/auth');
const Bat = require('../models/Bat');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: './public/uploads/',
  filename: function(req, file, cb) {
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
  }
});

// Initialize upload
const upload = multer({
  storage: storage,
  limits: { fileSize: 1000000 }, // 1MB limit
  fileFilter: function(req, file, cb) {
    checkFileType(file, cb);
  }
}).single('image');

// Check file type
function checkFileType(file, cb) {
  // Allowed extensions
  const filetypes = /jpeg|jpg|png|gif/;
  // Check extension
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Check mime
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb('Error: Images only (jpeg, jpg, png, gif)');
  }
}

// GET all bats
router.get('/', async (req, res) => {
  try {
    const bats = await Bat.find().sort({ createdAt: -1 });
    res.render('bats/index', {
      title: 'All Bats',
      bats
    });
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Failed to load bats');
    res.redirect('/');
  }
});

// GET new bat form
router.get('/new', ensureAuthenticated, (req, res) => {
  res.render('bats/new', {
    title: 'Add New Bat'
  });
});

// POST create new bat
router.post('/', ensureAuthenticated, (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      req.flash('error_msg', err);
      return res.redirect('/bats/new');
    }
    
    if (!req.file) {
      req.flash('error_msg', 'Please upload an image');
      return res.redirect('/bats/new');
    }

    const { brandName, price, desc, brandAmbassador } = req.body;
    let errors = [];

    // Validate required fields
    if (!brandName || !price || !desc || !brandAmbassador) {
      errors.push({ msg: 'Please fill in all fields' });
    }

    if (errors.length > 0) {
      // Remove uploaded file since validation failed
      fs.unlinkSync(`./public/uploads/${req.file.filename}`);
      
      res.render('bats/new', {
        title: 'Add New Bat',
        errors,
        brandName,
        price,
        desc,
        brandAmbassador
      });
    } else {
      try {
        const newBat = new Bat({
          brandName,
          price,
          desc,
          brandAmbassador,
          image: `/uploads/${req.file.filename}`,
          user: req.user.id
        });

        await newBat.save();
        req.flash('success_msg', 'Bat added successfully');
        res.redirect('/bats');
      } catch (err) {
        console.error(err);
        req.flash('error_msg', 'Failed to add bat');
        res.redirect('/bats/new');
      }
    }
  });
});

// GET show single bat
router.get('/:id', async (req, res) => {
  try {
    const bat = await Bat.findById(req.params.id);
    
    if (!bat) {
      req.flash('error_msg', 'Bat not found');
      return res.redirect('/bats');
    }

    res.render('bats/show', {
      title: bat.brandName,
      bat
    });
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Failed to load bat details');
    res.redirect('/bats');
  }
});

// GET edit bat form
router.get('/:id/edit', ensureAuthenticated, async (req, res) => {
  try {
    const bat = await Bat.findById(req.params.id);
    
    if (!bat) {
      req.flash('error_msg', 'Bat not found');
      return res.redirect('/bats');
    }

    res.render('bats/edit', {
      title: `Edit ${bat.brandName}`,
      bat
    });
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Failed to load edit form');
    res.redirect('/bats');
  }
});

// PUT update bat
router.put('/:id', ensureAuthenticated, async (req, res) => {
  try {
    const bat = await Bat.findById(req.params.id);
    
    if (!bat) {
      req.flash('error_msg', 'Bat not found');
      return res.redirect('/bats');
    }

    // Update bat with new values (except brandName)
    const { price, desc, brandAmbassador } = req.body;
    
    bat.price = price;
    bat.desc = desc;
    bat.brandAmbassador = brandAmbassador;

    await bat.save();
    req.flash('success_msg', 'Bat updated successfully');
    res.redirect(`/bats/${bat.id}`);
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Failed to update bat');
    res.redirect('/bats');
  }
});

// DELETE bat
router.delete('/:id', ensureAuthenticated, async (req, res) => {
  try {
    const bat = await Bat.findById(req.params.id);
    
    if (!bat) {
      req.flash('error_msg', 'Bat not found');
      return res.redirect('/bats');
    }

    // Delete image file
    if (bat.image) {
      const imagePath = path.join(__dirname, '..', 'public', bat.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    // Delete bat from database
    await Bat.findByIdAndDelete(req.params.id);
    req.flash('success_msg', 'Bat deleted successfully');
    res.redirect('/bats');
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Failed to delete bat');
    res.redirect('/bats');
  }
});

module.exports = router;