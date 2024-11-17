import express from "express";
import { AuthController } from "../controllers/AuthController";
import { UserService } from "../services/UserService";
import { AppDataSource } from "../config/data-source";
import { User } from "../entity/User";
import logger from "../config/logger";
const router = express.Router();

const userRepository = AppDataSource.getRepository(User);
const userService = new UserService(userRepository); //This is only called dependency injection
//Dependency Injection :- Jo bhi dependency aapko chahiye hoti hai apki class ke liye usko aap constructor ke andar se receive karte ho
const authController = new AuthController(userService, logger);
router.post("/register", (req, res, next) =>
    authController.register(req, res, next),
);

export default router;
