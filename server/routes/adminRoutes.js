const adminRouter = require('express').Router();
const { verifyAdmin } = require('../middleware/adminAuth');

const { loginAdmin,
  signUpAdmin,
  Credit,
  createTransactionPin,
  suspendUser,
  unBlockUserAcc
} = require('../controller/adminController')


adminRouter.post('/admin-login', loginAdmin);

adminRouter.post('/admin-signup', signUpAdmin);

adminRouter.use(verifyAdmin);

adminRouter.put('/credit-account', verifyAdmin, Credit);

adminRouter.put('/create-admin-pin', verifyAdmin, createTransactionPin);

adminRouter.put('/suspend-user', suspendUser);

adminRouter.put('/unblock-user', unBlockUserAcc);


module.exports = adminRouter;