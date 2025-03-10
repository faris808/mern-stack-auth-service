import "reflect-metadata";
import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import logger from "./config/logger";
import cookieParser from "cookie-parser";
import { HttpError } from "http-errors";
import authRouter from "./routes/auth";
import tenantRouter from "./routes/tenant";
import userRouter from "./routes/user";
import { Config } from "./config";

const app = express();
app.use(
    cors({
        origin: Config.ORIGIN,
        credentials: true,
    }),
);
app.use(express.static("public"));
app.use(cookieParser());
app.use(express.json());

// eslint-disable-next-line @typescript-eslint/no-misused-promises
app.get("/", (req, res) => {
    res.send("Welcome to auth service and hello world and hello everyone");
});

app.use("/auth", authRouter);
app.use("/tenants", tenantRouter);
app.use("/users", userRouter);

//Ye ensure karna hai ki ye sab se last mein aaye tab hi saare error ko ye catch kar payega
//Global error handler
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: HttpError, req: Request, res: Response, next: NextFunction) => {
    logger.error(err.message);
    const statusCode = err.statusCode || err.status || 500;
    res.status(statusCode).json({
        errors: [
            {
                type: err.name,
                msg: err.message,
                path: "",
                location: "",
            },
        ],
    });
});

export default app;
