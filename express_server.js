//DEPENDENCIES 

const { getUserByEmail } = require('./helpers');
const express = require("express");
const app = express();
const PORT = 8080; // default port 8080;
var cookieSession = require('cookie-session');
const { url } = require("inspector");
const bcrypt = require("bcryptjs");


//MIDDLEWARE

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'session',
  keys: ['secretKey'],
  maxAge: 24 * 60 * 60 * 1000
}));

// HELPER FUNCTIONS

function urlsForUser(id) {
  let object = {};
  for (let shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID === id) {
      object[shortURL] = urlDatabase[shortURL];
    }
  }
  return object;
};
function generateRandomString() {
  let randomString = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  for (var i = 0; i < 7; i++) {
    randomString += characters[(Math.floor(Math.random() * charactersLength))];
  }
  return randomString;
};

// OBJECTS URL DATABASE & USERS

const urlDatabase = {
  'b6UTxQ': {
    'longURL': "https://www.tsn.ca",
    'userID': "userRandomID",
  },
  'i3BoGr': {
    'longURL': "https://www.google.ca",
    'userID': "userRandomID",
  },
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "us@e.com",
    password: "1234",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "us2@e.com",
    password: "abcd",
  },
};

// GET ROUTES

app.get("/", (req, res) => {
  res.send("Hello!");
});


app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  const userId = req.session.user_id;
  const user = users[userId];
  if (!user) {
    return res.redirect('/login');
  }
  const templateVars = {
    urls: urlsForUser(userId),
    user
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const userId = req.session.user_id;
  const user = users[userId];
  const templateVars = {
    urls: urlDatabase,
    user
  };
  if (!user) {
    return res.redirect('/login');
  }
  res.render('urls_new', templateVars);
});

app.get("/urls/:id", (req, res) => {
  const id = req.params.id;
  const userId = req.session.user_id;
  if (!userId) {
    return res.send('please login to view resource').status(403);
  }
  if (urlDatabase[id].userID !== userId) {
    return res.send("User does not own URL").status(403);
  }
  const longURL = urlDatabase[id].longURL;
  const user = users[userId];
  const templateVars = {
    id,
    longURL,
    user
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
  const id = req.params.id;
  const longURL = urlDatabase[id].longURL;
  for (let id in users) {
    if (!id) {
      res.send('You are not logged in therefore you cannot shorten URL');
    } else {
    }
  }
  res.redirect(longURL);
});

app.get("/login", (req, res) => {
  const userId = req.session.user_id;
  const user = users[userId];
  const templateVars = {
    user,
  }
  if (user) {
    res.redirect('urls');
  }
  res.render("login", templateVars);
});

app.get("/register", (req, res) => {
  const id = req.params.id;
  const userId = req.session.user_id;
  const user = users[userId];
  if (user) {
    return res.redirect('/urls');
  }
  const templateVars = {
    id,
    user
  };
  res.render("register", templateVars)
});

// POST ROUTES

app.post("/urls", (req, res) => {
  let longURL = req.body.longURL;
  let id = generateRandomString();
  urlDatabase[id] = { 
    longURL, 
    userID: 
    req.session.user_id 
  };
  res.redirect(`/urls/${id}`);
});

app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id;
  const user = req.session.user_id;
  if (!id) {
    res.status(400).send('id does not exist');
  }
  if (!user) {
    res.status(400).send('user is not logged in');
  }
  if (urlDatabase[id].userID === user) {
    delete urlDatabase[id];
  } else {
    res.send('Error can only be deleted if they belong to user').status(403);
  }
  res.redirect("/urls");
});

app.post("/urls/:id", (req, res) => {
  let longURL = req.body.longURL;
  urlDatabase[req.params.id] = longURL;
  res.redirect(`/urls`);
  if (!longURL) {
    res.status(400).send('URL does not exist');
  }
  if (!user) {
    res.status(400).send('user is not logged in');
  }
});

app.post("/urls/:id/update", (req, res) => {
  const updatedURL = req.body.longURL;
  let id = req.params.id;
  urlDatabase[id] = {
    longURL: updatedURL,
    userID: req.session.user_id
  };
  if (updatedURL === "") {
    return res.status(400).send('error status');
  }
  res.redirect(`/urls`);
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect('/login');
});


app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);
  bcrypt.compareSync(password, hashedPassword);
  if (email.length === 0 || password.length === 0) {
    return res.status(400).send('error status code 400');
  }

  for (let id in users) {
    if (users[id].email === email && users[id].password === password) {
      req.session.user_id = id;
      res.redirect("/urls");
    }
  }
  res.status(403).send("invalid sign in attempt");

});

app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);

  if (email.length === 0 || password.length === 0) {
    return res.status(400).send('error status code 400');
  }
  const id = generateRandomString();
  thisUser = {
    id,
    email,
    hashedPassword
  };
  users[id] = thisUser;
  req.session.user_id = id;
  res.redirect("/urls");
});

// LISTENING ON PORT

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
