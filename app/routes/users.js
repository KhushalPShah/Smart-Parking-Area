const express = require('express');
const router = express.Router();
//Router, is an object of Middleware, just like app(app = express()).
//Thus, this created Middleware can be accessed from any other file.
//For that, we use the router.
//Thus, the app Object, created in the App.js file can be used within this file, by taking the value
// of that app object, in this users.js file.
//Thus, now we will have everything as router.get and not app.get.

const User = require('../models/user');
const BookedParking = require('../models/bookparking');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const config = require('../config/database')


router.post('/register',function(req,res,next)   //This indirectly means as /user/register, since we are in the Users file.
{
    console.log("Register Request");
    let newUser = new User({        //Let is a data type, which allows the variable to be used, within the first enclosing braces.
        name : req.body.name,
        email : req.body.email,
        username : req.body.username,
        password : req.body.password,
        balance :200
    });
    User.addUser(newUser,function(err,user){
        if(err)
        {
            res.json({success:false,msg:"Failed to register the User"});
        }
        else
        {
            console.log("New User Registered");
            res.json({success:true,msg:"User Registered."});
        }
    });

});

router.post('/authenticate',function(req,res,next)   //This indirectly means as /user/register, since we are in the Users file.
{
    console.log("Authenticate Request Received");
    const user_name = req.body.username;
    const password = req.body.password;
    User.getUserByUserName(user_name,function(err,user)
    {
        if(err)
        {
            throw err;
        }
        if(!user)
        {
            return res.json({success : false, msg : "User not Registered."});
        }
        User.comparePassword(password,user.password,function(err,isMatch)
        {
            if(err)
            {
                throw err;
            }
            if(isMatch)
            {
                const token = jwt.sign({data : user},config.secret,{
                    //expiresIn:604800    //Assigning the Token for 1 Week. Value in Seconds.
                    expiresIn:600
                });
                res.json({success : true, token : "JWT "+token, User : {id : user._id, name : user.name, userName : user.username, email : user.email , balance : user.balance }});
                //The token is stored in the Browser Cache at the Client Side Angular App.
                //Then, the request to protected routes must be sent along with the Token from the 
                //client side.
                console.log("Response to Authentication Route Sent + "+user.balance.toString());
            }
            else
            {
                console.log("Wrong Pass");
                return res.json({success : false, msg : "Wrong Password."});
            }
        })
})
});

router.get('/profile',verfifyToken_users ,function(req,res,next)   //This indirectly means as /user/register, since we are in the Users file.
{
    console.log("Request to Profile Verification");
    jwt.verify(req.token,config.secret,function(err,user)
    {
        if(err)
        {
            return res.json({success : false});
        }
        else
        {
            return res.json({success : true, user: user});
        }
    
    });
});
router.get('/profilePage',function(req,res)
{
    res.sendFile("/home/khushal/Documents/TestFolder/MEANFiles/app/public/newprofile.html");
    console.log("Profile Page Sent");
});

//Reference for the TOKEN Verification Stuff.
//https://www.youtube.com/watch?v=7nafaH9SddU
function verfifyToken_users(req, res, next)
{
    console.log(req.headers.authorization);
    const JWT_header = req.headers['authorization'];
    if(typeof JWT_header !== 'undefined'){
        const bearer = JWT_header.split(" ");
        const token = bearer[1];
        req.token = token;
        console.log("Profile TOken Found");
        next();
    }
    else
    {
        next();
    }

}

module.exports = router;    //This line exports the Router as a module, thus allowing this file to use the app.
