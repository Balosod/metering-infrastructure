const express = require('express');
const app = express();
app.use(express.static('public'));
const session = require('express-session');
var flush = require('connect-flash');
const request = require('request');
const _ = require('lodash');
const path = require('path');
const bodyParser = require('body-parser');
var urlencodedParser = bodyParser.urlencoded({extended: true});
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'control')));
const {initializePayment, verifyPayment} = require('./control/paystack')(request);
const port = process.env.PORT || 3000;
const firebase = require('firebase');
   
  const firebaseConfig = {
    apiKey: "",
    authDomain: "advance-metering.firebaseapp.com",
    databaseURL: "https://advance-metering-default-rtdb.firebaseio.com",
    projectId: "advance-metering",
    storageBucket: "advance-metering.appspot.com",
    messagingSenderId: "",
    appId: "",
    measurementId: ""
  };
    firebase.initializeApp(firebaseConfig)
    let database = firebase.database();
    app.set('view engine','ejs');

    app.use(session({
      secret: 'secret',
      cookie: {masAge : 6000},
      resave: true,
      saveUninitialized: true
    }));
    app.use(flush());    

  //   app.use(function (req, res, next) {
  //     res.locals.flash_success_message = req.flash('flash_success_message'); 
  //     res.locals.flash_error_message = req.flash('flash_error_message');        
  //     next();
  // });
app.get('/',   (req,res)=>{
    res.render('sign', {
      message: req.flash('message'),
      title: "ADVANCE MATERING INFRASTRUCTURE"  
  });
  });
  app.post('/verification',  urlencodedParser, (req,res,next)=>{
    var meter_number = req.body.meter_number;
    var password = req.body.password;
    console.log(meter_number);
    var ref =firebase.database().ref(meter_number);
        ref.once('value')
         .then(function(snapshot){
            a = snapshot.exists();  // true
            users = snapshot.val()
        
           console.log("yes you are good to go", a);
              console.log(users);
              
  if(a===false){
    req.flash('message', 'Meter Number or Password incorrect');
    return res.redirect('/');
  }
  else{
    password1=users.password
    if (users && password ==password1){
         req.session.loggedin = true;
         req.session.meter_number = meter_number;
         req.flash('message', 'You are logged in');
         res.redirect('/home');
      } else{
      req.flash('message', 'Meter Number or Password incorrect');
      return res.redirect('/');
      }
      res.end();
   
    }
    res.end();
   
  });
});

app.get('/home', (req,res)=>{
    if(req.session.loggedin){
        res.render('user', {
          message: req.flash('message'),
          title: "ADVANCE MATERING INFRASTRUCTURE",
          users:users
          });
        }else{
          req.flash('message', 'You need to login to access this home page');
          return res.redirect('/')
        }
      });
  
app.get('/payment',  (req,res)=>{
  if(req.session.loggedin){
    res.render('bought', {
      title: "ADVANCE MATERING INFRASTRUCTURE"  
  });
    }else{
      req.flash('message', 'You need to login to access this pament page');
      return res.redirect('/')
    }
     
    });
  
app.post('/paystack',urlencodedParser, (req,res)=>{
      const form = _.pick(req.body,['amount','email','full_name','meter_number']);
      form.metadata = {
          full_name : form.full_name,
          meter_number :form.meter_number
      }
      form.amount *= 100;
      var ref =firebase.database().ref(form.meter_number);
      ref.once('value')
       .then(function(snapshot){
           a = snapshot.exists();
      if(a){
        initializePayment(form, (error, body)=>{
          if(error){
              //handle errors
              console.log(error);
              return res.redirect('/error');
          }
          response = JSON.parse(body);
          res.redirect(response.data.authorization_url)
      }); 

      }else{
        return res.redirect('/error');
      }
    });
    
        });
    
app.get('/paystack/callback', (req,res) => {
    const ref = req.query.reference;
    verifyPayment(ref, (error,body)=>{
        if(error){
            //handle errors appropriately
            console.log(error)
           // return res.redirect('/error');
        }
        response = JSON.parse(body); 
        const data = _.at(response.data, ['reference', 'amount','customer.email', 'metadata.full_name','metadata.meter_number']);
  
          [reference, amount, email, full_name, meter_number] =  data;  
        console.log(data) 
        console.log(amount)
        amount /=100;
        console.log(amount);
       //ASSUMING #30 PERUNIT OF ENERGY
       // #30. = 1000W/h
       const cost = 30;
       var rate = ((amount * 1000)/30);
      // Converted back to Kwh;
           rate /=1000;
        var fixedR1 = parseFloat(rate).toFixed(2);
        var fixedR2 = parseFloat(fixedR1);
       var energy  = fixedR2;
        console.log(energy);
        console.log('users',meter_number, 'paid')
        database.ref(meter_number+"/bought_energy").set(energy) ;
        req.flash('message', 'payment successfull');
        res.redirect('/');  
    })
   });
   app.get('/password',  (req,res)=>{
        res.render('password', {
          message: req.flash('message'),
          title: "ADVANCE MATERING INFRASTRUCTURE",
          });
  });
   app.post('/changepassword', urlencodedParser, (req,res)=>{
    var meter_number = req.body.meter_number;
    var reference = req.body.reference;
    var ref =firebase.database().ref(meter_number);
        ref.once('value')
         .then(function(snapshot){
             a = snapshot.exists();  // true
            users = snapshot.val()
    if(a===false){
      req.flash('message', 'Meter Number or Reference Number incorrect');
      return res.redirect('/password');
    }else{
           reference1=users.reference
      if (users && reference ===reference1){
        res.render('changed', {
          message: req.flash('message'),
          title: "ADVANCE MATERING INFRASTRUCTURE",
          });
        } else{
          req.flash('message', 'Meter Number or Reference number incorrect');
        return res.redirect('/password');
        }
    }
   
      res.end();
  });
  
  });
  app.get('/changed',  (req,res)=>{
    res.render('changed', {
      message: req.flash('message'),
      title: "ADVANCE MATERING INFRASTRUCTURE"  
  });
      });
  app.post('/reset', urlencodedParser, (req,res)=>{
    var meter_number = req.body.meter_number;
    var newpassword = req.body.newpassword;
    var confirmpassword = req.body.confirmpassword;
    var ref =firebase.database().ref(meter_number);
    ref.once('value')
     .then(function(snapshot){
         a = snapshot.exists();  // true
    if(a===false){
      req.flash('message', 'Meter Number does not exist');
      return res.redirect('/changed');
    } else{
      if(newpassword == confirmpassword){
        database.ref(meter_number+"/password").set(newpassword) ;
        req.flash('message', 'You have successfully changed your password');
        res.redirect('/');  
      } else{
        req.flash('message', 'Password did not match');
        res.redirect('/changed');
      }
    }
   
    });
  });
   app.get('/logout',  (req,res)=>{
    req.session.destroy((err)=>{})
    return res.redirect('/');
  });
  app.get('/error',  (req,res)=>{
    res.render('error', {
      title: "ADVANCE MATERING INFRASTRUCTURE"  
  });
  });


app.listen(port, ()=>{console.log('Server started at port 3000')});
