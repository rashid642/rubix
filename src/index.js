const express = require("express");
const path = require("path");
const hbs = require("hbs");
const passport = require("passport");
const flash = require("express-flash");
const session = require("express-session");
const methodOverride = require("method-override");
const upload = require("express-fileupload");
const connection = require("./utils/dbconnection");
const fs = require('fs');

const databasepath = path.join(__dirname, "./database/drdetails.json")
const loadDrDetails = () => {
    try {
        const dataBuffer = fs.readFileSync(databasepath);
        const dataJSON = dataBuffer.toString();
        return JSON.parse(dataJSON);
    } catch (e) {
        console.log("inside catch " + e);
        return [];
    }
}
const listDoctor = (id) => {
    return new Promise((resolve, reject) => {
        const doctors = loadDrDetails();
        const doctor = doctors.find((dr) => dr.id === id);
        resolve(doctor);
    })
}

//using passport
const initializePassport = require("./utils/passportConfig");
initializePassport(passport, email => {
    return new Promise((resolve, reject) => {
        const sql = "SELECT * FROM `userdetail` WHERE `email` = '" + email + "'";
        connection.query(sql, (err, rows) => {
            console.log(rows[0]);
            resolve(rows[0]);
        })
    })
}, id => {
    return new Promise((resolve, reject) => {
        const sql = "SELECT * FROM `userdetail` WHERE `id` = " + id + "";
        connection.query(sql, (err, rows) => {
            console.log(rows[0]);
            resolve(rows[0]);
        })
    })
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
app.use(express.json());
app.use(upload());

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

app.get("/", checkAuthenticated, (req, res) => {
    res.render("index", {
        name: req.user.name,
    })
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
        let password = req.body.password
        console.log(name+email+password);
        const sql = "INSERT INTO `userdetail` (`id`, `name`, `email`, `password`, `status`) VALUES (NULL, '" + name + "', '" + email + "', '" + password + "', 'patient');"
        connection.query(sql, (err, rows) => {
            if(!err){
                res.redirect("/login");
            }else{
                res.redirect("/register");
            }
        })
    } catch (err){
        console.log(err);
        res.redirect("/register");
    }
})
app.get("/drregister", checkNotAuthenticated, (req, res) => {
    res.render("drregister")
})
app.post("/drregister", checkNotAuthenticated, async (req, res) => {
    const uploadpath = path.join(__dirname, "./uploads")
    console.log(uploadpath);
    var file = req.files.file
    var filename = file.name;
    try {
        const sql = "INSERT INTO `drdetail` (`id`, `fullname`, `email`, `speciality`, `qualification`, `experience`, `address`, `certificate`, `password`, `date`) VALUES (NULL, '" + req.body.fullname + "', '" + req.body.email + "', '" + req.body.speciality + "', '" + req.body.qualification + "', '" + req.body.experience + "', '" + req.body.address + "', '" + uploadpath + "/" + filename + "', '" + req.body.password + "', current_timestamp());"
        connection.query(sql, (erro, rows) => {
            file.mv(uploadpath + "/" + filename, (error) => {
                res.redirect("/login");
            })
        })
    } catch (err) {
        res.redirect("/drregister")
    }
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

//pages
app.get("/bookappointment", [checkAuthenticated, checkIsNotDoctor], (req, res) => {
    const data = loadDrDetails();
    res.render("bookappointment", {
        name: req.user.name,
        data
    })
})
app.get("/drprofile", [checkAuthenticated, checkIsNotDoctor], async (req, res) => {
    console.log("id " + req.query.id);
    const id = parseInt(req.query.id);
    const data = await listDoctor(id);
    console.log(data);
    res.render("drprofile", {
        name: req.user.name,
        data
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

function checkIsDoctor(req, res, next) {
    if (req.user.status === "doctor") {
        return next();
    } else {
        res.redirect("/userdashboard");
    }
}
function checkIsNotDoctor(req, res, next) {
    if (req.user.status !== "doctor") {
        return next();
    } else {
        res.redirect("/drdashboard");
    }
}

app.listen(port, () => {
    console.log(`server is up on ${port}`);
})
