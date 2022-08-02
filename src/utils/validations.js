const Joi = require('joi');
const passwordComplexity = require("joi-password-complexity").default;
const complexityOptions = {
    min: 8,
    max: 250,
    lowerCase: 1,
    upperCase: 1,
    numeric: 1,
    symbol: 1,
    requirementCount: 2,
};
const loginSchema = Joi.object({
    name: Joi.string()
            .min(3)
            .max(40)
            .required(),
    password: Joi.string()
            .min(1)
            .required()
});

const emailSchema = Joi.object({
    email: Joi.string()
            .email({ minDomainSegments: 2, tlds: false })
});

const verificationSchema = Joi.object({
    code: Joi.string().min(6),
    password: passwordComplexity(complexityOptions)
});

const createUserSchema = Joi.object({
    firstName: Joi.string().min(3).max(25).required(),
    middleName: Joi.string().min(3).max(25).required(),
    lastName: Joi.string().min(3).max(25).required(),
    email: Joi.string().email({ minDomainSegments: 2, tlds: false }).required(),
    alias: Joi.string().min(3).max(25).required(),
    username: Joi.string().min(3).max(25).required(),
})

const changePasswordSchema = Joi.object({
    password: passwordComplexity(complexityOptions)
})

export {
    loginSchema,
    emailSchema,
    verificationSchema,
    createUserSchema,
    changePasswordSchema,
};