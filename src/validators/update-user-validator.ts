import { checkSchema } from "express-validator";

export default checkSchema({
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
    role: {
        errorMessage: "role is required!",
        notEmpty: true,
        trim: true,
    },
    email: {
        isEmail: {
            errorMessage: "Invalid email!",
        },
        errorMessage: "Email is required!",
        notEmpty: true,
        trim: true,
    },
    tenantId: {
        notEmpty: true,
        errorMessage: "Tenant id is required!",
        trim: true,
    },
});
