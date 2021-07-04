const paystack = (request) => {
  const MySecretKey ='sk_test_b470ca00bd0e0b51f1be4fa9a374d740f297788d';
  // sk_test_xxxx to be replaced by your own secret key
 const initializePayment = (form, mycallback) =>{
  const options = {
    url : 'https://api.paystack.co/transaction/initialize',
    headers : {
        authorization: 'sk_test_b470ca00bd0e0b51f1be4fa9a374d740f297788d',
        'content-type': 'application/json',
        'cache-control': 'no-cache'
    },
   form
}
  const callback = (error, response, body)=>{
     return mycallback(error, body);
}
request.post(options,callback);
}

const verifyPayment = (ref, mycallback) => {
  const options = {
      url : 'https://api.paystack.co/transaction/verify/'+encodeURIComponent(ref    ),
      headers : {
          authorization: 'sk_test_b470ca00bd0e0b51f1be4fa9a374d740f297788d',
          'content-type': 'application/json',
          'cache-control': 'no-cache'
     }
  }
  const callback = (error, response, body)=>{
      return mycallback(error, body);
  }
  request(options,callback);
}
 return {initializePayment, verifyPayment};
}

module.exports = paystack;