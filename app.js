require("dotenv").config();

const server = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
// const md5 = require("md5");
const session = require('express-session');
const passport = require('passport');
const passportlocalmongoose = require('passport-local-mongoose');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const findOrCreate = require('mongoose-findorcreate')
//const encrypt = require("mongoose-encryption");


const app = server();

app.use(bodyParser.urlencoded({extended:true}));
app.use(server.static("public"));
app.set('view engine','ejs');

app.use(session({
  secret:"Mysecretkey",
  resave:false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://localhost:27017/userdb");

const registerschema = new mongoose.Schema({
  username:String,
  password:String,
  secret:String
})

registerschema.plugin(passportlocalmongoose);
// const secret = process.env.SECRET;
// registerschema.plugin(encrypt,{secret:secret , encryptedFields:['password']});
registerschema.plugin(findOrCreate);

const register = mongoose.model("user",registerschema);

passport.use(register.createStrategy());

passport.serializeUser(function(user, cb) {
  process.nextTick(function() {
    cb(null, { id: user.id, username: user.username });
  });
});

passport.deserializeUser(function(user, cb) {
  process.nextTick(function() {
    return cb(null, user);
  });
});


passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/secrets"
  },
  function(accessToken, refreshToken, profile, cb) {
    console.log(profile);
    register.findOrCreate({ googleId: profile.id }, function (err, user) {
      return cb(err, user);
    });
  }
));

app.route("/")
 .get((req,res)=>{
   if(req.isAuthenticated()){
     res.redirect("/secrets");
   }else{
     res.render("home");
   }
 })

app.get('/auth/google',
   passport.authenticate('google', { scope: ['profile'] }));


app.route("/register")
 .get((req,res)=>{
   res.render("register");
 })
 .post((req,res)=>{
   register.register({username:req.body.username},req.body.password,(err,user)=>{
     if(err){
       console.log(err.message);
       res.redirect("/register");
     }else{
       passport.authenticate("local")(req,res,function(){
         res.redirect("/secrets");
       })
     }
   })
 })

 app.get("/secrets",(req,res)=>{
   if(req.isAuthenticated()){
     res.render("secrets");
   }else{
     res.redirect("/login");
   }
 })

 app.get("/auth/google/secrets",
  passport.authenticate('google', { failureRedirect: "/login" }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect("/secrets");
  });

app.route("/login")
 .get((req,res)=>{
  res.render("login");
 })
 .post((req,res)=>{
   const user = new register({
     username:req.body.username,
     password:req.body.password
   })

   req.login(user,(err)=>{
     if(err){
       console.log(err.message);
     }else{
       passport.authenticate("local")(req,res,()=>{
         res.redirect("/secrets");
       })
     }
   })
 })

 app.get('/logout', function(req, res, next) {
   req.logout(function(err) {
     if (err) { return next(err); }
     res.redirect('/');
   });
 });

app.route("/submit")
 .get((req,res)=>{

 })
 .post((req,res)=>{

 })

app.listen(3000,(err)=>{
  if(err){
    console.log(err.message);
  }else{
    console.log("Server has been Started at Port 3000");
  }
})
