const paystack = (request) => {
  const MySecretKey = 'Bearer sk_test_b470ca00bd0e0b51f1be4fa9a374d740f297788d';
  //replace the secret key with that from your paystack account
  const initializePayment = (form, mycallback) => {
    const options = {
          url : 'https://api.paystack.co/transaction/initialize',
          headers : {
              authorization: MySecretKey,
              'content-type': 'application/json',
              'cache-control': 'no-cache'    
          },
          form
      }
      const callback = (error, response, body) => {
          return mycallback(error, body)
      }
      console.log(options);
      request.post(options, callback)
  }

  const verifyPayment = (ref, mycallback) => {
      const options = {
          url : 'https://api.paystack.co/transaction/verify/'+encodeURIComponent(ref),
          headers : {
              authorization: MySecretKey,
              'content-type': 'application/json',
              'cache-control': 'no-cache'    
          }
      }
      const callback = (error, response, body) => {
          return mycallback(error, body)
      }
      request(options, callback)
  }

  return {initializePayment, verifyPayment};
}

module.exports = paystack;