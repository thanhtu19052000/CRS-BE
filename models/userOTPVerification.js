const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserOTPVerificationSchema = new Schema({
    userId: {
        type: String,
        expires: 300
    },
    otp: {
        type: String,
        expires: 300
    },
    createDate: {
        type: Date,
        expires: 300
    },
    expiresAt: {
        type: Date,
        expires: 300
    },
});

const UserOTPVerification = mongoose.model('userOTPVerification', UserOTPVerificationSchema);

module.exports =  { UserOTPVerification };