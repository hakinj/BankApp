const jwt = require('jsonwebtoken');

async function verifyUser(req, res, next){
  try{
     const token = req.cookies.userToken
      await jwt.verify(token, process.env.JWT_SECRET, (err, verifiedToken) => {
        if(verifiedToken){
            next()
        }else{
          res.redirect('/api/v1/login-user')
        }
        
      })
  }
  catch(err){
    console.log(err.message)
  }
};


// async function getCurrentUser(req, res, next){

// }

module.exports = {verifyUser};