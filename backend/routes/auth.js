const express = require('express');
const User = require('../models/User');
const router = express.Router();
const user = require("../models/User");
const { body, validationResult } = require('express-validator');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
const JWT_SECRET = 'Harryisagood$oy';
var fetchuser= require('../middleware/fetchuser');
// Route1 Create a User using: POST "/api/auth/createuser" No login required


router.post('/createuser',[body('email').isEmail(),body('name').isLength({ min: 5 }),body('password').isLength({ min: 5 })
],async(req, res)=>{
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  //check whether user with this email exists already
  try{

  
  let user = await User.findOne({email:req.body.email});
  if(user){
    return res.status(400).json({error:"Sorry a user with this email already exists"})
  }
  const salt = await bcrypt.genSalt(10);
  const secPass = await bcrypt.hash(req.body.password,salt);
   user = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: secPass,
  })
  const data={
    user:{
      id:user.id
    }
  }
  const authtoken= jwt.sign(data, JWT_SECRET);
  
  //res.json(user);
  res.json({authtoken});
} catch(error){
  console.log(error.message);
  res.status(500).send("Some Error occured");
}
})
//Route2 User login : POSt "/api/auth/login". No login required.
router.post('/login',[
  body('email','Enter a valid email').isEmail(),
  body('password','Password cannot be blank').exists(),
],async (req,res)=>{
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const {email, password}=req.body;
  try {
    let user =await User.findOne({email});
    if(!user){
      return res.status(400).json({error:"Please try to login with correct credentials"});
    }

    const passwordCompare = await bcrypt.compare(password, user.password);
    if(!passwordCompare){
      return res.status(400).json({error:"Please try to login with correct credentials"});
    }
    const data = {
      user:{
        id:user.id
      }
    }
    const authtoken = jwt.sign(data,JWT_SECRET);
    res.json({authtoken})
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Internal Server Error");
  }
})
//Route3: Get loggedin user details using: POST "/api/auth/getuser".Login required.
router.post('/getuser',fetchuser,async (req,res)=>{
try {
  userId =req.user.id;
  const user = await User.findById(userId).select("-password")
  res.send(user)
} catch (error) {
  console.log(error.message);
  res.status(500).send("Internal Server Error"); 
}
})


module.exports= router;