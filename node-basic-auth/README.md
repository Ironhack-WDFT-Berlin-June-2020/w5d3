# Node Basic Authentication

First some terminology:
Authentication vs Authorization

Passwords are hashed - not in plain text in the database


## Implement SignUp

### Necessary Steps

#### GET request to signup shows form - username and password

```js
// routes/auth.js

```

- POST to signup route - if password is empty or < 8 show form again with error message

- If username exists in database show message username is already taken

- Otherwise hash password, create user in database and redirect to profile page

#### To hash the password we use bcrypt

```bash
$ npm install bcrypt
```

Implement Login



Session and Cookies
 a session is a temporary and interactive information interchange between two or more communicating devices, or between a computer and user - a login session is the period between the user logging in and
 out of a system.

https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies

// some more info about cookies: 
**************************************************
From a technical perspective, the definition of a Cookie can be found here. Loosely, think of a cookie as a piece of data returned by the Web Server you connected to in the past. This data is associated with the host that returned that data and can never be seen by other hosts. When you subsequently connect to the host in the future, the previously returned value (the cookie value) is sent back to the server. This allows the server to generate some data that can be used to "remember you" when you subsequently come back.

A session cookie is still "just a cookie" but is used to maintain "state of the session". For example, imagine a shopping cart. If you place items in your cart, the server will send back a cookie value that is a key used to find your cart again. If you place items in your cart today and come back tomorrow, the server can use the cookie value to lookup your cart.

As for "ending a session" ... this can be done at the browser by asking the browser to "forget" the cookie such that when you subsequently visit the web site, there is no cookie and hence it has no knowledge of your past interactions. Alternatively, the server can choose to ignore any cookie value you sent. A cookie can also have an implicit self deletion value such that if a time has passed, the cookie evaporates. Finally, the server can ask for the cookie value to be replaced / deleted when you next visit it.

Nice tutorial con be found here:

https://www.tutorialspoint.com/expressjs/expressjs_sessions.htm

*******************************


$ npm install express-session connect-mongo

add these two lines to app.js
const session    = require("express-session");
const MongoStore = require("connect-mongo")(session);

// and configure the session maxAge is in milliseconds, secret is to sign the cookie
// store - defaults to memoryStore - not recommended for production
app.use(session({
  secret: "basic-auth-secret",
  cookie: { maxAge: 60000 },
  store: new MongoStore({
    mongooseConnection: mongoose.connection,
    ttl: 24 * 60 * 60 // 1 day
  })
}));

- Add login form

- Add get route to display the login form:
// in auth.js 
router.get("/login", (req, res) => {
  res.render("login");
});

- Add post login route and logic

- add profile route in index.js 

- Add loginCheck() middleware in index.js to protect profile page route

- Add logout route 

- Add logout link in profile page

- Show cookie setting in index.js profile route if interesting 