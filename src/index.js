const express = require("express");
const path = require("path");
const hbs = require("hbs");
const passport = require("passport");
const flash = require("express-flash");
const session = require("express-session");
const methodOverride = require("method-override");
const connection = require("./utils/dbconnection");

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

let users = [];

app.get("/", checkAuthenticated, (req, res) => {
    res.render("index")
})
// can pass req.user.name
app.get("/register", checkNotAuthenticated, (req, res) => {
    res.render("register")
})
app.post("/register", checkNotAuthenticated, async (req, res) => {
    try {
        let id = Date.now().toString();
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
app.get("/login", checkNotAuthenticated, (req, res) => {
    res.render("login");
})
app.post("/login", checkNotAuthenticated, passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
    failureFlash: true,
}))
app.delete("/logout", (req, res) => {
    req.logOut();
    res.redirect("/login");
})

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

app.listen(port, () => {
    console.log(`server is up on ${port}`);
})
