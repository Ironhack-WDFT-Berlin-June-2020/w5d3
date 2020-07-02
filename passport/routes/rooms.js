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


router.get('/:roomId/', (req, res, next) => {
  const query = { _id: req.params.roomId };
  console.log(req.user);
  if (req.user.role !== 'admin') {
    query.owner = req.user._id;
    // so if the currently logged in user is not an admin the query will look like this
    // { _id: req.params.roomId, owner: req.user._id };
  }

  Room.findOneAndDelete(query)
    .then(() => {
      res.redirect('/rooms')
    })
    .catch(err => {
      next(err);
    })
});


module.exports = router;
