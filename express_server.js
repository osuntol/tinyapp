const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
var cookieParser = require('cookie-parser');

app.set("view engine", "ejs")
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
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
function generateRandomString() {
  let randomString = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  for (var i = 0; i < 7; i++) {
    randomString += characters[(Math.floor(Math.random() * charactersLength))];
  }
  return randomString;
}



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
  const userId = req.cookies['user_id']
  const user = users[userId]
  console.log("USERS:", user)
  const templateVars = { 
    urls: urlDatabase,
    user
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const userId = req.cookies['user_id'] 
  const user = users[userId]
  const templateVars = { 
    urls: urlDatabase,
    user
  };
  
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  
  const id = req.params.id;
  const longURL = urlDatabase[id];
  const userId = req.cookies['user_id'];
  const user = users[userId]
  const templateVars = { 
    id, 
    longURL,
    user
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
  const id = req.params.id; 
  const longURL = urlDatabase[id];
  res.redirect(longURL);
});



app.post("/urls", (req, res) => {
  
  let longURL = req.body.longURL;
  let id = generateRandomString(); 
  urlDatabase[id] = longURL;
  res.redirect(`/urls/${id}`);
});

app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id;
  delete urlDatabase[id];
  res.redirect("/urls");
})

app.post("/urls/:id", (req, res)=>{
  let longURL = req.body.longURL
  urlDatabase[req.params.id]= longURL
  res.redirect(`/urls`)
})

app.post("/urls/:id/update", (req, res) =>{
  const updatedURL = req.body.longURL;
  let id = req.params.id
 urlDatabase[id]= updatedURL
 res.redirect(`/urls`)
})

app.post("/logout", (req, res) => {
  res.clearCookie("user_id")
  res.redirect('/login')
})

app.get("/login", (req,res) =>{
  const userId = req.cookies['user_id'];
  const user = users[userId]
  const templateVars = {
    user,
  }
  res.render("login", templateVars);
})

app.post("/login", (req, res) =>{
  const email = req.body.email;
  const password =req.body.password;
  if(email.length === 0 || password.length === 0){
    return res.status(400).send('error status code 400')
  }  
  
  for (let id in users){
    if (users[id].email === email && users[id].password === password){
      res.cookie("user_id",id);
      res.redirect("/urls");
    }
  }
  res.status(403).send("invalid sign in attempt")
console.log("REQ.USER:",users)

})

app.post("/register", (req, res) =>{
  const email = req.body.email;
  const password =req.body.password;
  if(email.length === 0 || password.length === 0){
   return res.status(400).send('error status code 400')
  }
  const id = generateRandomString();
  thisUser={
    id,
    email,
    password
  }
  console.log("USER:", users)
  for (let id in users){
    if (thisUser.email === users[id].email){
     return res.status(400).send('error status code 400')
    }
  }
  users[id]= thisUser

console.log("REQ.USER:",users)
res.cookie("user_id",id)
res.redirect("/urls", )
})

app.get("/register", (req, res) => {

  res.render("register")
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
