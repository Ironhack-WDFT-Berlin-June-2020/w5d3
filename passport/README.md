# Passport - authentication middleware for node js

Good Explanation of (de)serialize in passport
https://stackoverflow.com/questions/27637609/understanding-passport-serialize-deserialize



Show the User model - without the github id and the roles

Show the signup - it is the same as in basic auth

Now we want to use passport for the login 
#### The different forms of authentication are called strategies in passport

#### We will use username and password : http://www.passportjs.org/docs/username-password/

```bash
$ npm install passport passport-local
```

```js
// app.js
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;


// app.js  -   put further down -  before express view engine setup
app.use(passport.initialize());
app.use(passport.session());


Now we need to add 3 things serialize and deserialize user and the strategy


// we serialize only the `_id` field of the user to keep the information stored minimum

passport.serializeUser((user, done) => {
  done(null, user._id);
});

// when we need the information for the user, the deserializeUser function is called with the id that we previously serialized to fetch the user from the database

passport.deserializeUser((id, done) => {
  User.findById(id)
    .then(dbUser => {
      done(null, dbUser);
    })
    .catch(err => {
      done(err);
    });
});


passport.use(
  new LocalStrategy((username, password, done) => {
    User.findOne({ username: username })
      .then(found => {
        if (found === null) {
          done(null, false, { message: 'Wrong credentials' });
        } else if (!bcrypt.compareSync(password, found.password)) {
          done(null, false, { message: 'Wrong credentials' });
        } else {
          done(null, found);
        }
      })
      .catch(err => {
        done(err, false);
      });
  })
);
```

### Now we add the login post route and use passport there


```js
// routes/auth.js

const passport = require('passport');

router.post(
  '/login',
  passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/auth/login',
    failureFlash: true,
    passReqToCallback: true
  })
);
```

#### In passport the user is not in req.session but in the request obj directly. So the loginCheck middleware can be changed to 

```js
// routes/index.js

const loginCheck = () => {
  return (req, res, next) => {
    // if (req.user)
    if (req.isAuthenticated()) {
      // if user is logged in, proceed to the next function
      next();
    } else {
      // else if user is not logged in, redirect to /login
      res.redirect('/auth/login');
    }
  };
};
```


#### And we can also give the user to the index view - change the index view to:

```js
// routes/index.js
router.get('/', (req, res, next) => {
  // passport
  const user = req.user;
  console.log('req.user: ', req.user);
  res.render('index', { user: user });
});
```

If we want to log in the user we can use req.login() or req.logout()

// routes/auth.js
In the post signup route:

      User.create({ username: username, password: hash })
        .then(dbUser => {
          // passport - login the user

          req.login(dbUser, err => {
             if (err) next(err);
             else res.redirect('/');
           });

        })


And the logout :
// routes/auth.js

router.get('/logout', (req, res, next) => {
  // passport
  req.logout();
  res.redirect('/');
});

For the error messages :

$ npm install connect-flash

// app.js

const flash = require('connect-flash');
app.use(flash());

Now the login route where we want to show the flash message:

// routes/auth.js
router.get('/login', (req, res) => {
  res.render('auth/login', { errorMessage: req.flash('error') });
});


*****************************************************************************

# Add Github Login


### Github Passport Strategy : 

https://github.com/jaredhanson/passport-github

#### OAuth for social login - a way to access external websites without creating a user account on it. You are using your social network to authenticate on other websites


#### Register app in github 

#### You need 
- github id

- github secret

$ npm install passport-github

// app.js
const GithubStrategy = require('passport-github').Strategy;

passport.use(
  new GithubStrategy(
    {
      clientID: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
      callbackURL: 'http://127.0.0.1:3000/auth/github/callback'
    },
    (accessToken, refreshToken, profile, done) => {
      // find a user with profile.id as githubId or create one
      User.findOne({ githubId: profile.id })
        .then(found => {
          if (found !== null) {
            // user with that githubId already exists
            done(null, found);
          } else {
            // no user with that githubId
            return User.create({ githubId: profile.id }).then(dbUser => {
              done(null, dbUser);
            });
          }
        })
        .catch(err => {
          done(err);
        });
    }
  )
);


// views/auth/login.hbs

<a href="/auth/github">Login via Github</a>


We need to have this route

// routes/auth.js

router.get('/github', passport.authenticate('github'));


router.get(
  '/github/callback',
  passport.authenticate('github', {
    successRedirect: '/',
    failureRedirect: '/auth/login'
  })
);

****************************************************************************

# Roles and authorization

Show the Rooms model 

Show the reference the owner field in the Rooms model 

Add the post rooms route: 

only logged in users can post - we want to enter the logged in user as ownder of the room

// routes/rooms.js

router.post('/', (req, res, next) => {
  // if user is not logged in we redirect
  if (!req.isAuthenticated()) {
    res.redirect('/');
    return;
  }

  Room.create({
    price: req.body.price,
    name: req.body.name,
    description: req.body.description,
    owner: req.user._id
  })
    .then(room => {
      console.log(room);
      res.redirect('/rooms');
    })
    .catch(err => {
      next(err);
    });
});

When we list all routes we have to do that :

// routes/rooms.js

router.get('/', (req, res, next) => {
  Room.find()
    .then(rooms => {
      res.render('rooms/index', { roomsList: rooms });
    })
    .catch(err => {
      next(err);
    });
  // if you would want to only show the rooms that the user owns : 
  // Room.find({ owner: req.user._id })
  //   .then(rooms => {
  //     res.render('rooms/index', { roomsList: rooms });
  //   })
  //   .catch(err => {
  //     next(err);
  //   });
});


Now add role to the user model

// models/User.js

const userSchema = new Schema({
  username: String,
  password: String,
  githubId: String,
  role: {
    type: String,
    enum: ['admin', 'user'],
    default: 'user'
  }
});


Now we add a delete route and check for the role there - the user can only delete rooms 
where she or he is the owner - the admin can delete any room

The click on the room on views/rooms/index.hbs deletes it

// routes/rooms.js

// deletes the room
// an admin can delete any room - a user can only delete can only 
// delete it when she is the owner
router.get('/:roomId/', (req, res, next) => {
  const query = { _id: req.params.roomId };

  if (req.user.role !== 'admin') {
    query.owner = req.user._id;
  }

  // if user.role !== 'admin'
  // query: { _id: req.params.roomId, owner: req.user._id }
  // else if user.role === 'admin'
  // query; { _id: req.params.roomId }

  Room.findOneAndDelete(query)
    .then(() => {
      res.redirect('/rooms');
    })
    .catch(err => {
      next(err);
    });
});

Bonus: 

refactor the middleware loginCheck to routes/middleware.js and require it in routes/rooms