const express = require("express");
const app = require("../app");
const router = express.Router();

/* GET home page */
router.get("/", (req, res, next) => {
  res.send('home');
});

// middleware to check if user is logged in
const loginCheck = () => {
  return (req, res, next) => {
    // is the user logged in 
    if (req.session.user) {
      next();
    } else {
      res.redirect('/login');
    }
  }
}

router.get('/profile', loginCheck(), (req, res) => {
  console.log('this is the cookie: ', req.cookies);
  console.log('this is the user: ', req.session.user);
  // res.cookie('myCookie', 'Roberto');
  // to delete a cookie
  // res.clearCookie('myCookie');
  res.render('profile');
})



module.exports = router;