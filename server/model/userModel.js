const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    firstname:{
        type: String,
        required: true
    },
    lastname:{
        type: String,
        required: true
    },
    email:{
        type: String,
        required: true,
        unique: true
    },
    password:{
        type: String,
        required: [true, "please enter a password"]
    },
    address:{
        type: String,
    },
    accountNum:{
        type: Number,
        unique: true
    },
    suspended:{
        type: Boolean,
        default: false
    },
    tel:{
        type: Number,
        required: true
    },
    accountBalance:{
        type: Number,
        default: 0
    },
    pin:{
        type: Number,
        default: "0000"
    },
    transactionHistory: {
        type: Array,
        default: []
    },
    beneficiary:{
        type: [Object]
    },
    accountType:{
        type: String
    }
}, {timestamps: true});

const UserModel = mongoose.model('user', userSchema);

module.exports = {UserModel};