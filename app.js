require("dotenv").config();

const server = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const md5 = require("md5");
//const encrypt = require("mongoose-encryption");


const app = server();

app.use(bodyParser.urlencoded({extended:true}));
app.use(server.static("public"));
app.set('view engine','ejs');

mongoose.connect("mongodb://localhost:27017/userdb");

const registerschema = new mongoose.Schema({
  email:{
    type:String,
    required:true
  },
  password:{
    type:String,
    required:true
  }
})

// const secret = process.env.SECRET;
// registerschema.plugin(encrypt,{secret:secret , encryptedFields:['password']});
//

const register = mongoose.model("user",registerschema);

app.route("/")
 .get((req,res)=>{
   res.render("home");
 })

app.route("/register")
 .get((req,res)=>{
   res.render("register");
 })
 .post((req,res)=>{
   const username = req.body.username;
   const pass = md5(req.body.password);

   const userdoc = new register({
     email:username,
     password:pass
   })

   userdoc.save(err=>{
     if(err){
       console.log(err);
     }else{
       console.log("Successfully registered");
       res.render("secrets");
     }
   })

 })


app.route("/login")
 .get((req,res)=>{
  res.render("login");
 })
 .post((req,res)=>{
   const username = req.body.username;
   const pass = md5(req.body.password);
   register.findOne({email:username},(err,finduser)=>{
     if(err){
       console.log(err);
     }else{
       if(finduser){
         if(finduser.password===pass){
           res.render("secrets");
         }else{
           var srct = '<script type="text/javascript"> alert("Please create an account") </script>';
           res.send(srct);
         }
       }else{
         var srct = '<script type="text/javascript"> alert("Please create an account") </script>';
         res.render("/home");
       }
     }
   })

 })

app.get("/logout",(req,res)=>{
  res.render("home");
})

app.get("/submit",(req,res)=>{
  res.render("submit");
})

app.listen(3000,(err)=>{
  if(err){
    console.log(err.message);
  }else{
    console.log("Server has been Started at Port 3000");
  }
})
