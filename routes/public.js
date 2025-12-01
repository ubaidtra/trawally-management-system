const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.render('public/home', { title: 'Home - Trawally Electrics & Plumbing' });
});

router.get('/about', (req, res) => {
  res.render('public/about', { title: 'About Us - Trawally Electrics & Plumbing' });
});

router.get('/contact', (req, res) => {
  res.render('public/contact', { title: 'Contact Us - Trawally Electrics & Plumbing' });
});

module.exports = router;

