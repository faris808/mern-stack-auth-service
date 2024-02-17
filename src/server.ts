import { Config } from "./config";
import app from "./app";
import logger from "./config/logger";

const StartServer = () => {
    const PORT = Config.PORT;
    try {
        app.listen(PORT, () => {
            logger.info(`App is listening on port ${PORT}`);
        });
    } catch (err: unknown) {
        if (err instanceof Error) {
            logger.error(err.message);
            setTimeout(() => {
                process.exit(1);
            }, 1000);
        }
    }
};

StartServer();
