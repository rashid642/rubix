const express = require("express");
const path = require("path");
const hbs = require("hbs");
const passport = require("passport");
const flash = require("express-flash");
const session = require("express-session");
const methodOverride = require("method-override");
const connection = require("./utils/dbconnection");

//using passport
const initializePassport = require("./utils/passportConfig");
initializePassport(passport, email => {
    return users.find(user => user.email === email)
}, id => {
    return users.find(user => user.id === id)
});

const app = express();
const port = process.env.PORT || 3000;

const publicDirectory = path.join(__dirname, "../public");
const viewsPath = path.join(__dirname, "../templates/views");
const partialsPath = path.join(__dirname, "../templates/partials");

app.set("view engine", "hbs");
app.set("views", viewsPath);
hbs.registerPartials(partialsPath);
app.use(express.static(publicDirectory));

app.use(flash());
app.use(session({
    secret: "secret",
    resave: false,
    saveUninitialized: false
}))
app.use(passport.initialize());
app.use(passport.session());
app.use(methodOverride("_method"));

//allow to access data from req
app.use(express.urlencoded({ extended: false }));

//temporarily using variable to store data
let users = [{
    id: '1642234097270',
    name: 'Rashid Aziz',
    email: 'md.r.a.n.786@gmail.com',
    password: '1',
    status: "user",
},
{
    id: '1642230622595',
    name: 'Doctor 1',
    email: 'dr1@d',
    password: '1',
    status: "doctor"
}
];

app.get("/", checkAuthenticated, (req, res) => {
    res.render("index")
})
// can pass req.user.name

//patient signup
app.get("/register", checkNotAuthenticated, (req, res) => {
    res.render("register")
})
app.post("/register", checkNotAuthenticated, async (req, res) => {
    try {

        let name = req.body.name;
        let email = req.body.email;
        let password = req.body.password;
        users.push({ id, name, email, password })
        res.redirect("/login");
    } catch {
        res.redirect("/register");
    }
    console.log(users);
})

//login
app.get("/login", checkNotAuthenticated, (req, res) => {
    res.render("login");
})
app.post("/login", checkNotAuthenticated, passport.authenticate("local", {
    successRedirect: "/userdashboard",
    failureRedirect: "/login",
    failureFlash: true,
}))
app.delete("/logout", (req, res) => {
    req.logOut();
    res.redirect("/login");
})

//dr dashboard
app.get("/drdashboard", [checkAuthenticated, checkIsDoctor], (req, res) => {
    res.render("drdashboard", {
        name: req.user.name
    })
})

//user dashboard
app.get("/userdashboard", [checkAuthenticated, checkIsNotDoctor], (req, res) => {
    res.render("userdashboard", {
        name: req.user.name
    })
})


//middlewares
function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next()
    }
    res.redirect('/login')
}

function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return res.redirect('/')
    }
    next()
}

function checkIsDoctor(req, res, next){
    if(req.user.status === "doctor"){
        return next();
    }else{
        res.redirect("/userdashboard");
    }
}
function checkIsNotDoctor(req, res, next){
    if(req.user.status !== "doctor"){
        return next();
    }else{
        res.redirect("/drdashboard");
    }
}

app.listen(port, () => {
    console.log(`server is up on ${port}`);
})
