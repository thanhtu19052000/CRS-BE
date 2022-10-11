const { DEFAULT_AVATAR } = require('../common/constants');
const mongoose = require('mongoose');

const userSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true
        },
        password: {
            type: String,
            required: true
        },
        phoneNumber: {
            type: String,
            required: true,
        },
        birthDay: {
            type: Date,
            required: true
        },
        authInfo: {
            type: String,

        },
        car_id: {
            type: String,
        },
        verified: {
            type: Boolean,
            default: false
        },
        token: {
            type: String,
            required: false
        },
        falseCount: {
            type: Number,
            default: 0
        },
        lockFlag: {
            type: Boolean,
            default: false
        },
        personalPortrait: {
            type: String
        },
        citizenID: {
            type: String
        },
        license: {
            type: String
        },
        photoVehicle: {
            type: String
        },
        registryVehicle: {
            type: String
        },
        vehicleRegistration: {
            type: String
        },
        avatar: {
            type: String,
            default: DEFAULT_AVATAR
        },
        isAccept: {
            type: String,
        }
    }
);

const UserModel = mongoose.model("users", userSchema);

module.exports = { UserModel }
