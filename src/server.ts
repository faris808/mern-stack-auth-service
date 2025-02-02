import { Config } from "./config";
import app from "./app";
import logger from "./config/logger";
import { AppDataSource } from "./config/data-source";
import { User } from "./entity/User";
import { Roles } from "./constants";
import bcrypt from "bcryptjs";
import { Repository } from "typeorm";

export const createAdminUser = async (userRepository: Repository<User>) => {
    const existingAdmin = await userRepository.findOne({
        where: { role: Roles.ADMIN },
    });

    if (!existingAdmin) {
        const saltRounds = 10;
        const hashedAdminPassword = await bcrypt.hash(
            String(Config.ADMIN_PASSWORD),
            saltRounds,
        );

        const adminUser = userRepository.create({
            firstName: "Super",
            lastName: "Admin",
            email: Config.ADMIN_EMAIL,
            password: hashedAdminPassword,
            role: Roles.ADMIN,
            tenant: undefined,
        });
        await userRepository.save(adminUser);
    }
};

export const StartServer = async () => {
    const PORT = Config.PORT;
    try {
        await AppDataSource.initialize();
        logger.info("Database connected successfully");

        const userRepository = AppDataSource.getRepository(User);
        await createAdminUser(userRepository);

        app.listen(PORT, () => {
            logger.info(`App is listening on port ${PORT}`);
        });
    } catch (err: unknown) {
        if (err instanceof Error) {
            console.log(err);
            console.log(err.message);
            logger.error(err.message);
            setTimeout(() => {
                process.exit(1);
            }, 1000);
        }
    }
};

void StartServer();
