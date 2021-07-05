const express = require('express');
const app = express();
const https = require('https')
const firebase = require('firebase');
const path = require('path');
const _ = require('lodash');
const axios = require('axios');
const request = require('request');
app.use(express.static(path.join(__dirname, 'control')));
const {initializePayment, verifyPayment} = require('./control/paystack')(request);
const bodyParser = require('body-parser');
app.use(bodyParser.json());
var urlencodedParser = bodyParser.urlencoded({extended: false});

app.set('view engine','ejs');
const firebaseConfig = {
    apiKey: "AIzaSyB05QhqkQa_JCYaLEFTtyJ4zouKUFKqjbU",
    authDomain: "library-testing-7fb5a.firebaseapp.com",
    databaseURL: "https://library-testing-7fb5a-default-rtdb.firebaseio.com",
    projectId: "library-testing-7fb5a",
    storageBucket: "library-testing-7fb5a.appspot.com",
    messagingSenderId: "362808701128",
    appId: "1:362808701128:web:c9990bd74acaff0a58b5fd",
    measurementId: "G-21C1MQ2EQR"
  };
  
  firebase.initializeApp(firebaseConfig)
  let database = firebase.database();

  const port = process.env.PORT || 3000;

app.get('/', (req,res)=>{
  var ref = database.ref("loadDetails");
      ref.once('value')
       .then(function(snapshot){
          var a = snapshot.exists();  // true
          var users = snapshot.val()
          console.log("yes u are good to go", a);
          console.log(users);
          res.render('user', {
            title: "ADVANCE MATERING INFRASTRUCTURE",
            users:users
            });
  });
});
app.get('/payment',  (req,res)=>{
    res.render('bought', {
      title: "ADVANCE MATERING INFRASTRUCTURE (PAYMENT-MODE)"  
  });
  });

  app.post('/paystack',urlencodedParser, (req,res)=>{
    const form = _.pick(req.body,['amount','email','full_name']);
    form.metadata = {
        full_name : form.full_name
    }
    form.amount *= 100;
    
    initializePayment(form, (error, body)=>{
        if(error){
            //handle errors
            console.log(error);
            return res.redirect('/error')
            return;
        }
        response = JSON.parse(body);
        res.redirect(response.data.authorization_url)
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
      const data = _.at(response.data, ['reference', 'amount','customer.email', 'metadata.full_name']);

        [reference, amount, email, full_name] =  data;  
      console.log(data) 
      console.log(amount)
      amount /=100;
      console.log(amount)
      var energy = amount; 
      database.ref("bought_energy").set(energy) 
      res.redirect('/');  
  })
  // var data= req.body;
  //   console.log(data);
  //   var pur = data.amount;
  //   database.ref("bought_energy").set(pur)
 });

app.listen(port, ()=>{console.log('Server started at port 3000')});