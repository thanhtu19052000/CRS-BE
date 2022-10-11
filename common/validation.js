const { binary } = require('@hapi/joi');
const Joi = require('@hapi/joi');

const registerValidation = (data) => {
    const schema = Joi.object({
        name: Joi.string()
            .min(8)
            .required(),
        email: Joi.string()
            .min(8)
            .required()
            .email(),
        password: Joi.string()
            .min(8)
            .max(24)
            .required(),
        phoneNumber: Joi.string()
            .length(10)
            .required()
            .pattern(/^[0-9]+$/),
        authInfo: Joi.string()
            .required(),
        birthDay: Joi.string()
            .required()
    });

    return schema.validate(data);
}

const loginValidation = (data) => {
    const schema = Joi.object({
        email: Joi.string()
            .min(8)
            .required()
            .email(),
        password: Joi.string()
            .min(8)
            .max(24)
            .required()
    });

    return schema.validate(data);
}

module.exports = {
    registerValidation,
    loginValidation
}