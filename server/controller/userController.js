const { UserModel } = require('../model/userModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { genAccNum } = require('../utils/genAccountNum');
const { CatchErrorFunc } = require('../utils/CatchErrorFunc');
const { HandleError } = require('../utils/error');
const { sendMail } = require('../utils/sendMail');
const { getCurrentUser } = require('../utils/getCurrentUser');

const period = 60 * 60 * 24;
//SIGN UP A USER
const loginForm = CatchErrorFunc(async (req, res) => {
    res.status(200).render('loginUser');
})

const signupForm = CatchErrorFunc(async (req, res) => {
    res.status(200).render('signupUser');
})

const homePage = CatchErrorFunc(async (req, res) => {
    const userId = await getCurrentUser(req);
    const user = await UserModel.findById(userId);
    console.log(user)
    res.status(200).render('home', {user});
}
);

const getTransferForm = CatchErrorFunc(async (req, res) => {
    res.status(200).render('transfer');
})


const signupUser = CatchErrorFunc(async (req, res) => {
    //console.log(req.body)
    const { firstname, lastname, email, password, address, tel } = req.body;
    const userExist = await UserModel.findOne({ email });
    if (userExist) {
        throw new HandleError(400, 'user with this email already exist', 400)
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new UserModel({
        firstname,
        lastname,
        email,
        password: hashedPassword,
        address,
        tel,
        accountNum: genAccNum()
    });

    const savedUser = await newUser.save()
    res.status(201).json({
        success: true,
        savedUser
    });
})


const loginUser = CatchErrorFunc(async (req, res) => {
    const { email, password } = req.body;
    const user = await UserModel.findOne({ email });
    if (user) {
        const correctPassword = await bcrypt.compare(password, user.password);

        if (correctPassword) {
            const token = await jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: period })
             if (token) {
                let text = `<h1>User Logged Into Cohort 3 Bank Application</h1>
                       <p> Hello ${user.firstname}, you have just logged into your account,
                       if you did not authorize this login kindly report to our support team
                        </p>
                       `
                await sendMail(user.email, "Successful Login", text);
                res.cookie('userToken', token, { maxAge: 1000 * period, httpOnly: true })
                 res.status(200).json({
                    success: true,
                    user,
                    token

                })
            } else {
                throw new HandleError(400, "invalid token", 400)
            }

        }
        else {
            throw new HandleError(process.env.WRONG_PASSWORD, 'invalid password', 400)
        }
    }
    else {
        throw new HandleError(400, 'invalid email', 400)
    }
});


const logoutUser = CatchErrorFunc(async (req, res) => {
    res.cookie('userToken', "", { maxAge: 0 });
    res.redirect('/api/v1/login-user');
})


const displayUpdatePasswordEmail = CatchErrorFunc(async (req, res) => {
    res.status(200).render('resetPasswordEmail');
});

const submitEmailForPasswordUpdate = CatchErrorFunc(async (req, res) => {
    const { email } = req.body;
    const user = await UserModel.findOne({ email })
    if (!user) {
        throw new HandleError(400, "user not found", 400)
    }
    await jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: 60 * 5 },
        async (err, token) => {
            if (err) {
                throw new HandleError(400, err.message, 400)
            }
            let text = `http://localhost:5000/api/v1/update-password/${user._id}/${token}`
            console.log(text)
            await sendMail(user.email, "Reset Password Link", text);
        });

});

const getUpdatePassword = CatchErrorFunc(async (req, res) => {
    const { id, token } = req.params;
    res.status(200).render('updatePassword', { id, token });
});

const postUpdatedPassword = CatchErrorFunc(async (req, res) => {
    const { id, token } = req.params;
    const { password } = req.body;
    console.log(password, id, token);

    await jwt.verify(token, process.env.JWT_SECRET, async (err, verifiedToken) => {
        if (err) {
            throw new HandleError(400, err.message, 400)
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt)
        const updatedPassword = await UserModel.findOneAndUpdate({ _id: id }, {
            password: hashedPassword
        });

        res.status(202).redirect('/api/v1/login-user');
    })
});

const generatePin = CatchErrorFunc(async (req, res) => {
    const { pin } = req.body;
    const userId = await getCurrentUser(req)
    const user = await UserModel.findByIdAndUpdate(userId, {
        pin
    })
    res.status(200).json({
        success: true,
        message: "your pin was updated successfully"
    })
});

const creditCustomer = CatchErrorFunc(async (req, res) => {
    console.log(req.body)
    const { amount, accountNum, pin } = req.body;
    const token = req.get('Authorization');
    const formattedToken = token.split(' ')[1]
    console.log(formattedToken)
    const payload = await jwt.verify(formattedToken, process.env.JWT_SECRET);
    const userId = payload.id
    const user = await UserModel.findById(userId);
    const customerToCredit = await UserModel.findOne({ accountNum });
    if (user.suspended) {
        throw new HandleError(process.env.ACC_SUSPENSION, "account marked for no debit, kindly contact customer support", 400)
    }
    if (Number(pin) === Number(user.pin)) {
        if (customerToCredit) {
            //Crediting
            const senderBalance = user.accountBalance;
            const recepientBalance = customerToCredit.accountBalance;

            if (senderBalance > amount) {

                const newBalance = Number(amount) + Number(recepientBalance)
                const newSenderBalance = Number(senderBalance) - Number(amount);
                const updatedRecipientAccount = await UserModel.findOneAndUpdate({ accountNum }, {
                    accountBalance: newBalance
                });
                const updatedSenderAccount = await UserModel.findByIdAndUpdate(userId, {
                    accountBalance: newSenderBalance
                });
                // await UserModel.updateOne({ email: user.email }, {
                //     beneficiary: { accountName: `${customerToCredit.firstname} ${customerToCredit.lastname}`, accountNum: customerToCredit.accountNum }
                // });
                user.beneficiary.push({
                    accountName: `${customerToCredit.firstname} ${customerToCredit.lastname}`,
                    accountNum: customerToCredit.accountNum
                });

                await user.save();


                // res.status(200).json({
                //     success: true,
                //     message: "Your transfer was successful",
                //     updatedSenderAccount
                // })
                res.status(200).json({
                    success: true,
                    message: `the transfer of ${amount} to ${customerToCredit.firstname} was successfull` 
                });
            } else {
                throw new HandleError(400, "insuffient funds", 400)
            }
        } else {
            throw new HandleError(400, "account number does not exist", 400)
        }
    } else {
        throw new HandleError(400, "incorrect pin", 400);
    }

});


const resetPin = CatchErrorFunc(async (req, res) => {
    const { oldPin, newPin } = req.body;
    const userId = await getCurrentUser(req)
    const us = await UserModel.findById(userId);
    if (Number(oldPin) === us.pin) {
        const user = await UserModel.findByIdAndUpdate(userId, {
            pin: newPin
        })
        res.status(200).json({
            success: true,
            message: "pin reset was successful"
        })
    } else {
        throw new HandleError(400, "wrong pin try again", 400)
    }

});

const comfirmUserToCredit = CatchErrorFunc(async (req, res) => {
   const {accountNum, amount, pin} = req.body;
   const userToCredit = await UserModel.findOne({accountNum});
//    console.log(userToCredit);
//    console.log(req.body);
   if(userToCredit){
     res.status(200).render("comfirmation", {amount, userToCredit});
   }else{
    throw new HandleError(400, "no user with this account", 400);
   }
})

// const getSuccessReciept = CatchErrorFunc(async (req, res) => {
//     res.status(200).render("comfirmation")
// });

const getCurrentUserFromClientSide = CatchErrorFunc(async (req, res) => {
    const payload = req.get('Authorization');
    const token = payload.split(' ')[1]
    const vverifiedToken = await jwt.verify(token, process.env.JWT_SECRET);
    const loggedInUser = await UserModel.findById(vverifiedToken.id);
    res.status(200).json({
        success: true,
        loggedInUser
    });
});


const getUserByAccpountNum = CatchErrorFunc(async (req, res) => {
    //console.log(req.body)
    const {accountNum} = req.body;
    const userDetails = await UserModel.findOne({accountNum});
    //console.log(userDetails)
    if(userDetails){
        res.status(200).json({
            success:true,
            userDetails
        })
    }else{
        throw new HandleError("user not found")
    }
 })

module.exports = {
    signupUser,
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
    //getSuccessReciept
};