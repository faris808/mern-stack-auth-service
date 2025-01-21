import express, { NextFunction, Request, Response } from "express";
import authenticate from "../middlewares/authenticate";
import { canAccess } from "../middlewares/canAccess";
import { Roles } from "../constants";
import tenantValidator from "../validators/tenant-validator";
import { UserController } from "../controllers/UserController";
import { UserService } from "../services/UserService";
import { AppDataSource } from "../config/data-source";
import { User } from "../entity/User";

const router = express.Router();
const userRespository = AppDataSource.getRepository(User);
const userService = new UserService(userRespository);
const userController = new UserController(userService);

router.post(
    "/",
    authenticate,
    canAccess([Roles.ADMIN]),
    tenantValidator,
    (req: Request, res: Response, next: NextFunction) =>
        userController.create(req, res, next),
);

// router.get("/", (req: Request, res: Response, next: NextFunction) =>
//     tenantController.getTenantList(req, res, next),
// );

// router.get("/:id", (req: Request, res: Response, next: NextFunction) =>
//     tenantController.getTenantById(req, res, next),
// );

// router.patch(
//     "/:id",
//     authenticate,
//     canAccess([Roles.ADMIN]),
//     tenantValidator,
//     (req: Request, res: Response, next: NextFunction) =>
//         tenantController.updateTenant(req, res, next),
// );

// router.delete(
//     "/:id",
//     authenticate,
//     canAccess([Roles.ADMIN]),
//     (req: Request, res: Response, next: NextFunction) =>
//         tenantController.deleteTenant(req, res, next),
// );

export default router;
