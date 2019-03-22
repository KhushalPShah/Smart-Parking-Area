const express = require('express');            //const is used for the variables that will not change through out the execution.
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const users = require('./routes/users');
const parkingplaces = require('./routes/parkingplaces');  
const passport = require('passport');
const mongoose = require('mongoose');
const config = require('./config/database');
const mqtt = require('mqtt');
//Cors is a Middleware. It allows the Web Application running at a certain Domain to request information
// from another Domain.
// Thus, say the Server responded with a Web Page, which inturn needs an Image from another Server.
//Thus, the CORS module, tells the Browser to allow the Web Page in itself query the another server,
//for the Request of the Image.
// Thus, it is Cross Origin Resource Sharing.
//It is implemented by using certain HTTP Headers.
//Thus, our Web Server will be accessible from any domain name, by the use of the CORS module.

mongoose.connect(config.database);  //This will connect to the MongoDB Database whose address is present in the database.js file.
mongoose.connection.on('connected',function()
{
    console.log("Connected to :"+config.database);
});

//For errors in Mongoose connection.
mongoose.connection.on('error',function(err)
{
    console.log("Error Connecting to Database. Error:"+err);
});

const app = express();          //Initialize the App variable with Express.
const port = 3000;

//This defines the Location of the file to look.       
//All the User Routes, are ideally to be kept in a single File.
//Thus, any routes, with /user, must be redirected to that file.
//thus, we use the above methode for that.
//Thus, we make a new Folder, called as Routes, and then make a file called as users.

//All the client side Angular Based files to be in the Public folder.
app.use(express.static(path.join(__dirname,'public')));

app.get('/',function(req,res)
{
    res.sendFile('/home/khushal/Documents/TestFolder/MEANFiles/app/public/index.html');
});

app.get('/login',function(req,res)
{
    console.log("Booking");
    res.sendFile('/home/khushal/Documents/TestFolder/MEANFiles/app/public/newlogin.html');
});




app.get('/signup',function(req,res)
{
    res.sendFile('/home/khushal/Documents/TestFolder/MEANFiles/app/public/newsignup.html');
});

app.use(cors());                //Using the CORS module.
app.use(bodyParser.json());     //Using Body Parser.
app.use('/user',users);        //Any routes, with /user, to be used from routes/users.js file.
app.use('/parkingplaces',parkingplaces);        //Any routes, with /user, to be used from routes/users.js file.

//Initialize the Passport.
//Passport is used to verify the User requests for Logging in.
//It is a Middleware.
app.use(passport.initialize());
app.use(passport.session());
require('./config/passport')(passport);



app.listen(port,function(req,res)
{
    console.log("Server started on Port "+port);
});

