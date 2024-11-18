import { checkSchema } from "express-validator";

export default checkSchema({
    email: {
        trim: true,
        notEmpty: {
            errorMessage: "Email is required!",
        },
        isEmail: {
            errorMessage: "Please provide a valid email address!",
        },
    },
    firstName: {
        errorMessage: "firstName is required!",
        notEmpty: true,
        trim: true,
    },
    lastName: {
        errorMessage: "lastName is required!",
        notEmpty: true,
        trim: true,
    },
    password: {
        trim: true,
        notEmpty: {
            errorMessage: "Password is required!",
        },
        isLength: {
            options: { min: 8 },
            errorMessage: "Password should be at least 8 chars",
        },
    },
});

// export default [body("email").notEmpty().withMessage("Email is required!")]
