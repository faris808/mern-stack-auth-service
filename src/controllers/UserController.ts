import { NextFunction, Request, Response } from "express";
import { UserService } from "../services/UserService";
import { CreateUserRequest } from "../types";
import { validationResult } from "express-validator";
import { Logger } from "winston";
import createHttpError from "http-errors";

export class UserController {
    constructor(
        private readonly userService: UserService,
        private readonly logger: Logger,
    ) {}
    async create(req: CreateUserRequest, res: Response, next: NextFunction) {
        // Validation
        const result = validationResult(req);
        if (!result.isEmpty()) {
            return res.status(400).json({ errors: result.array() });
        }

        const { firstName, lastName, email, password, tenantId, role } =
            req.body;
        try {
            const user = await this.userService.create({
                firstName,
                lastName,
                email,
                password,
                role,
                tenantId,
            });
            res.status(201).json({ id: user.id });
        } catch (error) {
            next(error);
            return;
        }
    }

    async getUserList(req: Request, res: Response, next: NextFunction) {
        try {
            const userslist = await this.userService.getUsersData();
            this.logger.info("Users list has been successfully fetched");
            res.status(200).json(userslist);
        } catch (error) {
            next(error);
            return;
        }
    }

    async getUserById(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.params.id;
            if (isNaN(Number(userId))) {
                next(createHttpError(400, "Invalid url params."));
                return;
            }
            const userdata = await this.userService.getUserDataById(
                Number(userId),
            );
            if (!userdata) {
                next(createHttpError(400, "User does not exist."));
                return;
            }
            this.logger.info("User has been successfully fetched", {
                id: userId,
            });
            res.json(userdata);
        } catch (error) {
            next(error);
            return;
        }
    }

    async updateUser(req: Request, res: Response, next: NextFunction) {
        const result = validationResult(req);
        if (!result.isEmpty()) {
            return res.status(400).json({ errors: result.array() });
        }

        const userId = req.params.id;
        if (isNaN(Number(userId))) {
            next(createHttpError(400, "Invalid url params."));
            return;
        }

        const { firstName, lastName, role } = req.body;
        try {
            await this.userService.updateUserById(Number(userId), {
                firstName,
                lastName,
                role,
            });
            this.logger.info("User has been successfully updated", {
                id: userId,
            });
            res.json({ id: Number(userId) });
        } catch (error) {
            next(error);
            return;
        }
    }

    async deleteUser(req: Request, res: Response, next: NextFunction) {
        const userId = req.params.id;
        if (isNaN(Number(userId))) {
            next(createHttpError(400, "Invalid url params."));
            return;
        }
        try {
            await this.userService.deleteUserById(Number(userId));
            this.logger.info("user data has been successfully deleted", {
                id: Number(userId),
            });
            res.json({ id: Number(userId) });
        } catch (error) {
            next(error);
            return;
        }
    }
}
