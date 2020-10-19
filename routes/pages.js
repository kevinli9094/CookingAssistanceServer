const express = require('express');

const router = express.Router();

/* GET create user page. */
router.get('/user/create', (req, res) => {
  res.render('createUser', { title: 'Create User' });
});

router.get('/admin', (req, res) => {
  res.render('adminPanel', { title: 'Admin Panel' });
});

module.exports = router;
