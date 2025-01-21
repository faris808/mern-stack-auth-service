import { checkSchema } from "express-validator";

export default checkSchema({
    name: {
        errorMessage: "Tenant Name is required!",
        notEmpty: true,
        trim: true,
    },
    address: {
        errorMessage: "Tenant Address is required!",
        notEmpty: true,
        trim: true,
    },
});
