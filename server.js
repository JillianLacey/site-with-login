const express = require("express");
const mustacheExpress = require("mustache-express");
const session = require("express-session"); //manages a lot of data
const bodyParser = require("body-parser");
const logger = require("morgan");
const path = require("path");
const sessionConfig = require("./sessionConfig");//imports session config file. do ./ because it's a file name. If not it looks for a node module.
const users = require("./data.js");//brings in the array with user info
const checkAuth = require("./middlewares/checkAuth");//protects info with middleware 
const app = express();
const port = process.env.PORT || 8000;

//TEMPLATING ENGINE
app.engine("mustache", mustacheExpress());
app.set("views", "./views");
app.set("view engine", "mustache");

//MIDDLEWARE
app.use(express.static(path.join(__dirname,"./public")));
app.use(logger("dev"));
app.use(bodyParser.urlencoded({extended: false}));//forms are encoded in the url. Body Parser turns it into JSON and then into an object. Converts it for us. 
app.use(session(sessionConfig));//calls and passes in session config


//BASE ROUTE
app.get("/", (req, res)=>{
    console.log(req.session);//we'll see an object with session id
    res.render("home");
});

//ROUTES
app.get("/signup", (req, res)=>{
    res.render("signup");
});

app.post("/signup", (req, res)=>{
    //logic that saves into data.js
    let newUser = req.body;
    console.log('newUser: ', newUser);
    //push new user into the data
    users.push(newUser);
    console.log('users: ', users);//see the array of users
    //create another link to redirect and render the login
    res.redirect("/login");
});

app.get("/login", (req, res)=>{
    res.render("login");
});

app.post("/login", (req, res)=>{
    // res.send("logged in!");
    let reqUsername = req.body.username;
    let reqPassword = req.body.password;
    //array method find - take a function and looks to see which item in array it matches
    let foundUser = users.find(user => user.username === reqUsername);//does user match username
    if(!foundUser){ //if doesn't match go back to login
        return res.render("login", {errors: ["user not found"]});
    }
    //if matches they are the right user with right password. 
    if(foundUser.password === reqPassword){
        delete foundUser.password; //NEVER send password over internet. delete it from the object.
        //take user object and put it inside the session object
        req.session.user = foundUser;
        res.redirect("/");//redirects to homepage if match
    } else {
        return res.render("login", {errors: ["passwords do not match"]});
    }
});

//NEW ROUTE FOR PROFILE PAGE
//checkAuth is the security in place to confirm authorization. Passed in as a function.
app.get("/profile", checkAuth, (req, res)=>{
    res.render("profile", {user: req.session.user});
})




app.listen(port, () =>{
    console.log(`running on ${port}!`)
});