import { Config } from "./config";
import app from "./app";
import logger from "./config/logger";
import { AppDataSource } from "./config/data-source";
import { User } from "./entity/User";
import { Roles } from "./constants";
import bcrypt from "bcryptjs";

export const createAdminUser = async () => {
    const userRepository = AppDataSource.getRepository(User);
    console.log("Request is coming here:");
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

const StartServer = async () => {
    const PORT = Config.PORT;
    try {
        await AppDataSource.initialize();
        logger.info("Database connected successfully");

        // Create admin user if not exists
        await createAdminUser();

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
