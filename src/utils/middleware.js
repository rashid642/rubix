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

module.export = {
    checkAuthenticated,
    checkNotAuthenticated,
    checkIsDoctor,
    checkIsNotDoctor
}