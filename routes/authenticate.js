const express = require('express');
const router = express.Router();
const userService = require('../services/userService');
const carService = require('../services/carService');
const verifyOTPService = require('../services/verifyOTPService');
const jwt = require('jsonwebtoken');

const mailUtil = require('../common/mailUtil');
const util = require('../common/util');
const bcrypt = require('bcryptjs');
const { registerValidation, loginValidation } = require('../common/validation');
const { FALSE_COUNT, JWT_CONFIG, JWT_EXCEPTION } = require('../common/constants');

router.post('/signup', async (req, res) => {
    let { name, email, password, phoneNumber, authInfo, birthDay } = req.body;
    name = name.trim();
    email = email.trim();
    password = password.trim();
    phoneNumber = phoneNumber.trim();
    birthDay = birthDay.trim();
    authInfo = authInfo.trim();

    //Validate the data 
    const {error} = registerValidation({ name, email, password, phoneNumber, authInfo, birthDay});

    if (error) {
        return res.status(200).json({
            status: "FAILED",
            message: error.details[0].message
        });
    }

    try {
        //Checking if user already exists
        const existUser = await userService.getUserByEmail(email);

        if (existUser != undefined || existUser != null) {
            res.status(200).json({
                status: "FAILED",
                message: "User with the provided email already exists"
            });
        } else {
            //Try to create new User

            //Password handling
            const saltRounds = await bcrypt.genSalt(10);
            let hashPassword = await bcrypt.hash(password, saltRounds);
            let userInput = {};

            //Check role
            if (authInfo === 'user') {
                userInput = {
                    name,
                    email,
                    password: hashPassword,
                    phoneNumber,
                    authInfo,
                    birthDay
                }
            } else if (authInfo === 'driver') {
                let { personalPortrait, citizenID, license, photoVehicle, registryVehicle, vehicleRegistration} = req.body;
                userInput = {
                    name,
                    email,
                    password: hashPassword,
                    car_id: '',
                    phoneNumber,
                    authInfo,
                    birthDay,
                    personalPortrait,
                    citizenID,
                    license,
                    photoVehicle,
                    registryVehicle,
                    vehicleRegistration
                }
            }

            const newUser = await userService.setUser(userInput);
            //const newUser = userInput;

            if (newUser != null) {
                let typeCar = req.body.typeCar;

                //Generate otp code
                const otp = util.generateOTPCode();
                const mailContent = `
                <h3>Verify Email</h3> 
                <p>Enter otp code to the app to verify your email address</p>
                <p>OTP CODE: <b>${otp}</b></p>
                <p><b>This code expires in 5 minutes!</b></p>
                `;
                //send otp to email
                console.info("[INFO] send verification OTP mail");
                mailUtil.sendMail(mailContent, email, 'Verify your email');

                //hash the otp
                const hashedOTP = await bcrypt.hash(otp, saltRounds);
                const OTPVerificationInput = {
                    userId: newUser._id,
                    otp: hashedOTP,
                    createDate: Date.now(),
                    expiresAt: Date.now() + 300000,
                }

                await verifyOTPService.setOTPVerification(OTPVerificationInput);

                //create car info for driver
                if (newUser.authInfo === 'driver') {
                    let car = {
                        car_name: '',
                        branch_id: newUser._id,
                        branch_name: newUser.name,
                        car_type_id: typeCar === 7 ? 'car7' : 'car4',
                        car_type: typeCar === 7 ? '7 cho' : '4 cho',
                        total_seat: typeCar
                    }

                    const newCar = await carService.setCar(car);

                    await userService.updateCar(newUser._id, newCar._id);
                }

                res.status(200).json({
                    status: "PENDING",
                    message: "Verification otp email sent",
                    data: newUser
                });
            }
        }   
    } catch (err) {
        console.error('[ERROR] /signup [Detail]:', err);
        res.status(500).json({
            status: "FAILED",
            message: err.message
        });
    }
    // res.status(200).json({
    //             status: "SUCCESS",
    //         });
});

router.post('/login', async (req, res) => {
    let { email, password } = req.body;
    email = email.trim();
    password = password.trim();

    try {
        //validate info
        const { error } = loginValidation({ email, password });
        if (error) {
            console.info('[ERROR] User information invalid');
            return res.status(200).json({
                status: "FAILED",
                message: error.details[0].message
            });
        }

        //get user data
        const userData = await userService.getUserByEmail(email);

        if (userData == null) {
            console.info('[ERROR] User data does not exist');
            return res.status(200).json({
                status: "FAILED",
                message: "Invalid email"
            });
        }

        //check lockFlag
        if (userData.lockFlag) {
            console.info("[INFO] account is locked");
            return res.status(200).json({
                status: "LOCKED",
                message: "Account is locked"
            });
        }

        //check user verified 
        if (!userData.verified) {
            console.info("[INFO] account is not verified yet");
            return res.status(200).json({
                status: "NOT-VERIFIED",
                message: "Account is not verified"
            });
        }

        //check user is accepted
        if (userData.isAccept !== 'success') {
            console.info("[INFO] account is not accepted yet");
            return res.status(200).json({
                status: "NOT-ACCEPTED",
                message: "Account is not accepted"
            });
        }

        //check password
        const validPassword = await bcrypt.compare(password, userData.password);
        if (!validPassword) {

            userData.falseCount++;
            if (userData.falseCount >= FALSE_COUNT) {
                // lock this account
                userData.lockFlag = true;
                await userService.updateUser(userData);

                return res.status(200).json({
                    status: "FAILED",
                    message: "Your account is locked due to consecutive login failed. Please contact admin to unlock"
                });
            }

            await userService.updateUser(userData);
            return res.status(200).json({
                status: "FAILED",
                message: "Invalid password"
            });
        }

        const accountInfo = {
            userId: userData._id,
            email: userData.email,
            name: userData.name,
            phoneNumber: userData.phoneNumber,
            authInfo: userData.authInfo,
        }

        const accessToken = jwt.sign(accountInfo, JWT_CONFIG.TOKEN_KEY, {expiresIn: JWT_CONFIG.TOKEN_LIFE_TIME});
        const refreshToken = jwt.sign(accountInfo, JWT_CONFIG.REFRESH_TOKEN_KEY, {expiresIn: JWT_CONFIG.REFRESH_TOKEN_LIFE_TIME});

        userData.token = refreshToken;

        await userService.updateUser(userData);

        console.info("[INFO] Login successfully by user:", userData.name);
        res.status(200).json({
            status: "SUCCESS",
            message: "Login successfully",
            user: {
                userId: userData._id,
                email: userData.email,
                name: userData.name,
                phoneNumber: userData.phoneNumber,
                authInfo: userData.authInfo,
                accessToken: accessToken,
                refreshToken: refreshToken
            }
        });
    } catch (err) {
        console.error("[ERROR] error! [Detail]:", err);
        res.status(500).json({
            status: "FAILED",
            message: "ERROR"
        });
    }
});

router.post('/token', async (req, res) => {
    const { refreshToken, email } = req.body;
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!refreshToken || refreshToken == '') return res.status(404).send("Invalid request");

    const userData = await userService.getUserByEmail(email);
    if (refreshToken != userData.token) return res.status(401).send( "Please login again!");

    jwt.verify(refreshToken, JWT_CONFIG.REFRESH_TOKEN_KEY, (err, decoded) => {
        if (err) return res.status(401).send(err.message);

        jwt.verify(token, JWT_CONFIG.TOKEN_KEY, (err) => {
            if (err) {
                //create new token
                delete decoded.exp;
                delete decoded.iat;

                const newToken = jwt.sign(decoded, JWT_CONFIG.TOKEN_KEY, {expiresIn: JWT_CONFIG.TOKEN_LIFE_TIME});

                console.info("[INFO] /refreshToken renew token: successfully!");
                return res.status(200).json({
                    accessToken: newToken,
                    refreshToken: refreshToken
                });
            }
            return res.status(200).json({status: "OK"});
        })
    });
});


router.post('/logout', async (req, res) => {
    const { userId, email, refreshToken } = req.body;
    try {
        const userData = await userService.getUserById(userId);

        if (userData == null || userData == undefined) return res.status(401).json({status: "FAILED"});

        if (refreshToken == userData.token) {
            userData.token = '';
            await userService.updateUser(userData);
        }

        console.info("[INFO] /logout: successfully!");
        res.status(200).json({ status: "SUCCESS"});
    } catch (err) {
        console.error("[ERROR] Logout error! [Detail]:", err);
        res.status(500).json({status: "FAILED"});
    }
});

module.exports = router;