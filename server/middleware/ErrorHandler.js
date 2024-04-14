const {HandleError} = require('../utils/error');

function ErrorHandler(error, req, res){
    let errors = {email: "", password: "", pin: ""}
   if(error instanceof HandleError){
    if(error.message === 'invalid password'){
        errors.password = 'you have entered a wrong password'
        return res.json({
            success: false,
            error: errors
        })
      }
    
      if(error.message === 'invalid email'){
        errors.email = 'this email does not exist'
        return res.json({
            success: false,
            error: errors
        })
      }

      if(error.message === 'wrong pin'){
        errors.pin = 'you have enter wrong pin'
        return res.json({
            success: false,
            error: errors
        })
      }

   }

   return res.status(400).json({
    success: false,
    error: error.message
})
};

module.exports = {ErrorHandler}