import { checkSchema } from "express-validator";
import { UpdateUserRequest } from "../types";

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
        errorMessage: "Tenant id is required!",
        trim: true,
        custom: {
            options: async (value: string, { req }) => {
                const role = (req as UpdateUserRequest).body.role;
                if (role === "admin") {
                    return true;
                } else {
                    return !!value;
                }
            },
        },
    },
});
