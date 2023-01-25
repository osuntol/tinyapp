const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs")

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
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


app.use(express.urlencoded({ extended: true }));
//app.use(cookieParser());

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
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:id", (req, res) => {
  
  const id = req.params.id;
  const longURL = urlDatabase[id];
  
  const templateVars = { id, longURL };
  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
  const id = req.params.id; 
  const longURL = urlDatabase[id];
  res.redirect(longURL);
});



app.post("/urls", (req, res) => {
  
  let longURL = req.body.longURL;
  let id = generateRandomString(); // Log the POST request body to the console
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
  console.log(updatedURL)
  let id = req.params.id
 urlDatabase[id]= updatedURL
 res.redirect(`/urls`)
})

app.post("/login", (req, res) => {
  const username = req.body.username
  res.cookie("username",username)
  res.redirect('/urls')

})

app.get("/login", (req,res) =>{
  res.render("_header.ejs");
})


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});