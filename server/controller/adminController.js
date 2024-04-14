const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { sendMail } = require('../utils/sendMail');
const { CatchErrorFunc } = require('../utils/CatchErrorFunc');
const { AdminModel } = require('../model/adminModel');
const { HandleError } = require('../utils/error');
const { UserModel } = require('../model/userModel');
const { getCurrentAdmin } = require('../utils/getCurrentAdmin');


const period = 60 * 60 * 24;

const signUpAdmin = CatchErrorFunc(async (req, res) => {
    const { name, email, password } = req.body;
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt)
    const newAdmin = AdminModel.create({ name, email, password: hashedPassword });

    res.status(201).json({
        success: true,
        newAdmin
    });

});

const loginAdmin = CatchErrorFunc(async (req, res) => {
    const { email, password } = req.body;
    const user = await AdminModel.findOne({ email });
    if (user) {
        const isPassword = await bcrypt.compare(password, user.password);
        if (isPassword) {
            await jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: period },
                async (err, token) => {
                    if (err) {
                        throw new HandleError(400, err.message, 400)
                    }
                    res.cookie('adminToken', token, { maxAge: 1000 * period, httpOnly: true });
                    res.status(200).json({
                        success: true,
                        user
                    })
                })
        } else {
            throw new HandleError(400, "invalid password", 404)
        }

    } else {
        throw new HandleError(400, "invalid email", 404)
    };
});

const createTransactionPin = CatchErrorFunc(async (req, res) => {
    const { pin } = req.body
    const id = await getCurrentAdmin(req)
    const admin = await AdminModel.findByIdAndUpdate(id, {
        pin
    })
    res.status(200).json({
        success: true,
        admin
    })
});

const Credit = CatchErrorFunc(async (req, res) => {
    const { accountNum, amount, pin } = req.body;
    console.log(pin)
    const id = await getCurrentAdmin(req)
    const admin = await AdminModel.findById(id);
    console.log(admin.pin)
    if (admin.pin === Number(pin)) {
        const userToCredit = await UserModel.findOne({ accountNum });
        const finalBalance = Number(userToCredit.accountBalance) + Number(amount);
        const updatedUserBalance = await UserModel.findOneAndUpdate({ accountNum }, {
            accountBalance: finalBalance
        })

        res.status(200).json({
            success: true,
            updatedUserBalance
        })
    }else{
        throw new Error(400, "wrong pin", 400)
    };

});

const suspendUser = CatchErrorFunc(async (req, res) => {
    const {accountNum} = req.body;
    const user = await UserModel.findOneAndUpdate({accountNum}, {
        suspended: true
    });
    if(!user){
        throw new HandleError(400, "user not found", 400)
    }
    res.status(200).json({
        success: true,
        message: `${user.firstname} has been suspended successfully`
    })
});

const unBlockUserAcc = CatchErrorFunc(async (req, res) => {
    const {accountNum} = req.body;
    const user = await UserModel.findOneAndUpdate({accountNum}, {
        suspended: false
    })
    if(!user){
        throw new HandleError(400, "user not found", 400)
    }
    res.status(200).json({
        success: true,
        message: `${user.firstname} ${user.lastname} account has been unblocked successfully`
    })
})

module.exports = {
    signUpAdmin,
    loginAdmin,
    Credit,
    createTransactionPin,
    suspendUser,
    unBlockUserAcc
}