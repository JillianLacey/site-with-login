module.exports = (req, res, next)=> {
    if(req.session.user){
        next();
    } else {
        return res.redirect("/");
    }
}

//if there is a user object you are allowed in ELSE go back to home 