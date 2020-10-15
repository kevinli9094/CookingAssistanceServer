const express = require('express');
const usersDB = require('../libs/data/users');

const router = express.Router();

/* GET home page. */
router.get('/', (req, res) => {
  usersDB.allUsers(res.app.db)
    .then((users) => {
      res.render('index', { title: 'Express', users });
    });
});

module.exports = router;
