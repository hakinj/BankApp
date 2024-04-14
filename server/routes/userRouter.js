const userRouter = require('express').Router();
const {signupUser,
     loginUser,
     loginForm,
     signupForm,
      homePage,
       logoutUser,
       displayUpdatePasswordEmail,
       submitEmailForPasswordUpdate,
       getUpdatePassword,
       postUpdatedPassword,
       creditCustomer,
       generatePin,
       resetPin,
       getTransferForm,
       comfirmUserToCredit,
       getCurrentUserFromClientSide,
       getUserByAccpountNum
     } = require('../controller/userController');
const {verifyUser} = require('../middleware/authUser');

//SIGN UP A USER
userRouter.post('/signup-user', signupUser);

userRouter.post('/login-user', loginUser);

userRouter.get('/login-user', loginForm);

userRouter.get('/signup-user', signupForm);

userRouter.get('/submit-email', displayUpdatePasswordEmail);

userRouter.post('/submitted', submitEmailForPasswordUpdate);

userRouter.get('/update-password/:id/:token', getUpdatePassword);

userRouter.put('/update-password/:id/:token', postUpdatedPassword);

userRouter.get('/current-user', getCurrentUserFromClientSide);

userRouter.post('/get-user-by-account', getUserByAccpountNum);

//userRouter.use(verifyUser);

userRouter.get('/home',  homePage);

userRouter.get('/logout-user', logoutUser);

userRouter.put('/credit-customer',  creditCustomer);

userRouter.put('/set-pin', generatePin);

userRouter.put('/reset-pin', resetPin);

userRouter.get('/transfer', getTransferForm);

userRouter.post('/comfirm', comfirmUserToCredit)

module.exports = userRouter;