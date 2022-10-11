const express = require('express');
const router = express.Router();
const verifyOTPService = require('../services/verifyOTPService');
const userService = require('../services/userService');
const util = require('../common/util');
const mailUtil = require('../common/mailUtil');

const bcrypt = require('bcryptjs');

router.post('/', async (req, res) => {
    try {
        let { userId, otp } = req.body;

        if (!userId || !otp) {
            return res.status(200).json({
                status: "FAILED",
                message: "Empty otp details are not allowed"
            });
        } 

        const checkList = await verifyOTPService.findByUserId(userId);

        if ( checkList.length <=0 ) {
            return res.status(200).json({
               status: "FAILED",
               message: "Account record doesn't exist or as been verified already. Please sign up or Login."
           });
       } 
           
       //user otp record exists
       const { expiresAt } = checkList[0];
       const hashedOTP = checkList[0].otp;

       if (expiresAt < Date.now()) {
           //user otp record has expired
           await verifyOTPService.deleteByUserId(userId);
           return res.status(200).json({
               status: "FAILED",
               message: "Code has expired. Please request again."
           });
       } 

       const validOTP = await bcrypt.compare(otp, hashedOTP);
       if (!validOTP) {
           //supplied otp is wrong
           return res.status(200).json({
               status: "FAILED",
               message: "Invalid code passed."
           });
       } 

       //success
       const user = await userService.getUserById(userId);
       let isAccept = 'success';

       if (user.authInfo === 'driver') isAccept = 'waiting';

       await userService.updateVerified(userId, isAccept);
       await verifyOTPService.deleteByUserId(userId);
       res.status(200).json({
           status: "VERIFIED",
           message: "User email verified successfully."
       });

    } catch (err) {
        res.status(500).json({
            status: "FAILED",
            message: err.message,
        })
    }
});

router.post('/resendOTP/', async (req, res) => {
    try {
        let { userId, email } = req.body;

        if (!userId || !email) {
            return res.status(200).json({
                status: "FAILED",
                message: "Empty info are not allowed."
            });
        } 

        const user = await userService.getUserById(userId);

        if (user.verified) {
            return res.status(200).json({
                status: "FAILED",
                message: "User have been verified!"
            });
        }

        // delete existing records and resend
        await verifyOTPService.deleteByUserId(userId);

        //Generate otp code
        const saltRounds = await bcrypt.genSalt(10);
        const otp = util.generateOTPCode();

        const mailContent = `
        <h3>Verify Email</h3> 
        <p>Enter otp code to the app to verify your email address</p>
        <p>OTP CODE: <b>${otp}</b></p>
        <p><b>This code expires in 5 minutes!</b></p>
        `;
        
        //send otp to email
        console.info("[INFO] send verification OTP mail");
        mailUtil.sendMail(mailContent, email);

        //hash the otp
        const hashedOTP = await bcrypt.hash(otp, saltRounds);
        const OTPVerificationInput = {
            userId,
            otp: hashedOTP,
            createDate: Date.now(),
            expiresAt: Date.now() + 300000,
        }

        const newOTPVerification = await verifyOTPService.setOTPVerification(OTPVerificationInput);

        res.status(200).json({
            status: "PENDING",
            message: "Verification otp email sent",
            data: {
                userId: newOTPVerification.userId,
                email,
            }
        });
    } catch (err) {
        res.status(500).json({
            status: "FAILED",
            message: err.message
        });
    }
});

module.exports = router;