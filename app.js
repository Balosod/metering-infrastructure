const express = require('express');
const app = express();
const firebase = require('firebase');
app.use(express.static("public"))

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

app.listen(port, ()=>{console.log('Server started at port 3000')});