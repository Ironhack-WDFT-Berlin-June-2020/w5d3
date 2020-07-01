const express = require('express');
const router = express.Router();
const Room = require('../models/Room');
const { loginCheck } = require('./middlewares');

router.get('/add', (req, res) => {
  res.render('rooms/add');
});

router.get('/', (req, res, next) => {
  Room.find()
    .then(rooms => {
      res.render('rooms/index', { roomsList: rooms })
    })
    .catch(err => {
      next(err);
    })
})
// only show the rooms of the logged in user
//   Room.find({owner: req.user._id})
//     .then(rooms => {
//       res.render('rooms/index', { roomsList: rooms })
//     })
//     .catch(err => {
//       next(err);
// });


router.post('/', (req, res, next) => {
  if (!req.isAuthenticated()) {
    res.redirect('/');
    return
  }
  const { price, name, description } = req.body;
  Room.create({
    price,
    name,
    description,
    owner: req.user._id
  })
    .then(room => {
      console.log(room);
      res.redirect('/rooms');
    })
    .catch(err => {
      next(err);
    })
});


module.exports = router;
