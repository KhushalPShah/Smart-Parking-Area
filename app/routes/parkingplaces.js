const express = require('express');
const router_parkingplaces = express.Router();
const BookedParking = require('../models/bookparking');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const config = require('../config/database')
const User = require('../models/user');
var nodemailer = require('nodemailer');
const mqtt = require('mqtt');

//Live Status Variables:
var s1_p1 = '0';
var s1_p2 = '0';
var s1_p3 = '0';
var s2_p1 = '0';
var s2_p2 = '0';
var s2_p3 = '0';

//MQTT Stuffs here.
var mqtt_client = mqtt.connect('mqtt://192.168.43.61',1883);
mqtt_client.on('connect', function()
{
    mqtt_client.subscribe("LS");        //Live Status
    console.log("MQTT Connected to Client LS");
});

mqtt_client.on('message',function(topic,message)
{
    data = JSON.parse(message.toString());
    console.log(data);
    if(data.SITEID == "1")
    {
        //Site ID 0;
        console.log("Site Id 1");
        s1_p1 = data.P1.toString();
        s1_p2 = data.P2.toString();
        s1_p3 = data.P3.toString();
    }
    else if(data.SITEID == "2")
    {
        //Site ID 1
        console.log("Site Id 2");
        s2_p1 = data.P1.toString();
        s2_p2 = data.P2.toString();
        s2_p3 = data.P3.toString();
    }
});
router_parkingplaces.post('/livestatus',function(req,res)
{
    console.log("Live Status Enquiry");
    var id = req.body.siteId.siteId;
    console.log("Site Id"+id);
    console.log("Live Status Enquiry for Site Id "+id);
    if(id === 0)
    {   
        res.json({success : true, P1 : s1_p1, P2 : s1_p2, P3 : s1_p3});
    }
    else if(id === 1)
    {
        res.json({success : true, P1 : s2_p1, P2 : s2_p2, P3 : s2_p3});
    }
});



router_parkingplaces.get('/getStatus',function(req,res)
{
    res.sendFile('/home/khushal/Documents/TestFolder/MEANFiles/app/public/new.html');
    console.log('Parking Status Page Sent');
});
router_parkingplaces.post('/getData',function(req,res)
{
    
    var id = req.body.siteId.siteId; 
    if(id === 0)    //Inorbit
    {
        console.log("GEt Data");
        res.json({success:true,siteName:"Inorbit Mega Mall",siteAddTitle : "Link Road, Malad (W)", siteAddDetail : "Mumbai",mapUrl : "https://www.google.com/maps/search/?api=1&query=Inorbit+Mega+Mall%2CMalad+West%2CMumbai"});
    }
    else if(id === 1)   //Infinity
    {
        res.json({success:true,siteName:"Infinity Mall",siteAddTitle : "Link Road, Malad (W)", siteAddDetail : "Mumbai",mapUrl : "https://www.google.com/maps/search/?api=1&query=Infinity+Mall%2CMalad+West%2CMumbai"});
    }
    else if(id === 2)   //Raghuleela
    {
        res.json({success:true,siteName:"Raghuleela Mega Mall",siteAddTitle : "Poinsur, Kandivali (W)", siteAddDetail : "Mumbai",mapUrl : "https://www.google.com/maps/search/?api=1&query=Raghuleela+Mega+Mall%2CKandivali+West%2CMumbai"});
    }
});
router_parkingplaces.post('/bookSlot',verfifyToken,function(req,res,next)
{
    jwt.verify(req.token,config.secret,function(err,parkingDetails)
    {
        console.log(req.token);
        if(err)
        {
            return res.json({success:false, err : err});
        }
        else 
        {
            console.log("User Attempt here");
            console.log(req.body.User);

            var User_rec = req.body.User;
            var id = User_rec.id;
            console.log("User Id is :"+id);
            User.getUserById(id,function(err,record_user)
            {
                console.log("Record : "+record_user);
                if(err)
                {
                    console.log(err);
                }
                else if(!record_user)
                {
                    // res.json({success : false, msg : "User Not Registered"});
                    console.log("User Not found");
                }
                else if(record_user)
                {
                    var record_user_balance = record_user.balance;
                    console.log("Balance : "+record_user_balance);
                    if(record_user_balance < 20)
                    {
                        return res.json({success : false, msg :"insuf balance"});
                    }
                    else 
                    {
                        record_user_balance = record_user_balance - 20;
                        record_user.balance = record_user_balance;
                        User.update(record_user,function(err,user)
                        {
                            console.log("Update Balance");
                            console.log(record_user);
                            console.log(req.body);
                            var time_from_hour = req.body.time_from_hour;
                            var time_from_mins = req.body.time_from_mins;

                            var time_to_hour = req.body.time_to_hour;
                            var time_to_mins = req.body.time_to_mins;

                            var from = time_from_hour+":" + time_from_mins;
                            var to = time_to_hour +":"+ time_to_mins;
                            var siteId = req.body.siteId.siteId.toString();

                            var slotNumber = req.body.slotNumber;
                            var BookSlotNumber = "";
                            if(slotNumber === 1)
                            {
                                BookSlotNumber = "P3";
                                console.log("P3");
                            }   
                            else if(slotNumber === 2)
                            {           
                                BookSlotNumber = "P2";   
                                console.log("P2");
                            }
                            else if(slotNumber === 3)
                            {       
                                BookSlotNumber = "P1";
                                console.log("P1");
                            }  
            
                            var today_Date = new Date();
                            
                            var today_year = today_Date.getFullYear().toString();
                            var today_month = today_Date.getMonth().toString();
                            var today_date = today_Date.getDate().toString();
                            var today_min = (today_Date.getMinutes()).toString();
                            var today_hour = (today_Date.getHours()).toString();
           
                            //From UTC:
                            var utc_from = ((new Date(Date.UTC(today_year,today_month,today_date,time_from_hour,time_from_mins,'0')).getTime())/1000);

                            //Convert to local UTC.
                            utc_from = (utc_from - 19800);


                            //To UTC:
                            var utc_to = ((new Date(Date.UTC(today_year,today_month,today_date,time_to_hour,time_to_mins,'0')).getTime())/1000);

                            //converting to Local UTC.
                            utc_to = (utc_to - 19800);
            
                            //Right Now UTC:
                            var utc_now = ((new Date(Date.UTC(today_year,today_month,today_date,today_hour,today_min,'0')).getTime())/1000);
    
                            //Converting to Local UTC.
                            utc_now = (utc_now - 19800);
                            
                            
                            let newSlotBooking = new BookedParking({
                                siteId : siteId,
                                AllotedSlot : BookSlotNumber.toString(),
                                From : utc_from,       
                                To : utc_to
                            });
                            BookedParking.bookSlot(newSlotBooking,function(err,user){
                            if(err)
                            {
                                console.log(err);
                                return res.json({success:false,msg:"Failed to Book a Slot"});
                            }
                            else
                            {
                                console.log("Booking Confirmed");
                                var transporter = nodemailer.createTransport({
                                    service: 'gmail',
                                    auth: {
                                      user: 'khushalshah021098@gmail.com',
                                      pass: 'khush981002#'
                                    }
                                  });
                                
                                  var mailOptions = {
                                    from: 'khushalshah021098@gmail.com',
                                    to: req.body.User.email,
                                    subject: 'Booking Confirmation',
                                    text: 'Congratulation! Your Parking Slot has been Booked. Details : Slot ID : '+user.AllotedSlot+', From : '+from.toString()+', To : '+to.toString()+"."
                                  };
                                  
                                  transporter.sendMail(mailOptions, function(error, info){
                                    if (error) {
                                      console.log(error);
                                    } else {
                                      console.log('Email sent: ' + info.response);
                                    }
                                  });
                                return res.json({success:true,msg:"Booking Registered",BookingDetails : user, User : record_user, From : from , To : to, token : "JWT "+req.token});

                            }
                        });
                    });
                    }
                }
            });
        }
    });
});
router_parkingplaces.post('/checkParkingAvail',verfifyToken,function(req,res,next)
{
    
    jwt.verify(req.token,config.secret,function(err,user)
    {
        if(err)
        {
            return res.json({success:false});
        }
        else 
        {
            console.log("Check Parking Avail");
            var time_from_hour = req.body.time_from_hour;
            var time_from_mins = req.body.time_from_mins;

            var time_to_hour = req.body.time_to_hour;
            var time_to_mins = req.body.time_to_mins;

            var siteId = req.body.siteId.siteId.toString();

            var today_Date = new Date();
            var today_year = today_Date.getFullYear().toString();
            var today_month = today_Date.getMonth().toString();
            var today_date = today_Date.getDate().toString();
            var today_min = (today_Date.getMinutes()).toString();
            var today_hour = (today_Date.getHours()).toString();

            console.log("Year Today : "+new Date().getFullYear().toString());

            //From UTC:
            var utc_from = ((new Date(Date.UTC(today_year,today_month,today_date,time_from_hour,time_from_mins,'0')).getTime())/1000);

            //Convert to local UTC.
            utc_from = (utc_from - 19800);

            //To UTC:
            var utc_to = ((new Date(Date.UTC(today_year,today_month,today_date,time_to_hour,time_to_mins,'0')).getTime())/1000);

            //converting to Local UTC.
            utc_to = (utc_to - 19800);
            
            //Right Now UTC:
            var utc_now = ((new Date(Date.UTC(today_year,today_month,today_date,today_hour,today_min,'0')).getTime())/1000);
            
            //Converting to Local UTC.
            utc_now = (utc_now - 19800);

            

            BookedParking.getBookedSlotBySiteId(siteId,utc_from,utc_to,function(err,bookedParkingById)
            {
                if(err)
                {
                    console.log(err);
                    return res.json({success:false});
                }
                else
                {
                    console.log(bookedParkingById.length);
                    console.log(bookedParkingById);
                    if(bookedParkingById.length === 3)
                    {
                        return res.json({success : true, length : bookedParkingById.length});
                    }
                    else
                    {
                        return res.json({success : true, BookingDetails : bookedParkingById , length : bookedParkingById.length});
                    }
                    
                }
            })
        }
    }); 
});
module.exports = router_parkingplaces;    //This line exports the Router as a module, thus allowing this file to use the app.

function verfifyToken(req, res, next)
{
    const JWT_header = req.headers['authorization'];
    if(typeof JWT_header !== 'undefined'){
        const bearer = JWT_header.split(" ");
        const token = bearer[1];
        req.token = token;
        next();
    }
    else
    {
        next();
    }

}