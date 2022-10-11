const { UserOTPVerification } = require('../models/userOTPVerification');

const setOTPVerification = async (OTPVerification) => {
    const newOTPVerification = new UserOTPVerification(OTPVerification);
    try {
        return await newOTPVerification.save();
    } catch (err) {
        throw new Error(err);
    }
}

const findByUserId = async (userId) => {
     try {
        return await UserOTPVerification.find({ userId });
     } catch (err) {
         throw new Error(err);
     }
}

const deleteByUserId = async (userId) => {
    try {
        return await UserOTPVerification.deleteMany({ userId });
    } catch (err) {
        throw new Error(err);
    }
}

module.exports = {
    setOTPVerification,
    findByUserId,
    deleteByUserId
}