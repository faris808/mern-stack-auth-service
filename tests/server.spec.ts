import { DataSource } from "typeorm";
import { User } from "../src/entity/User";
import { createAdminUser } from "../src/server";
import { AppDataSource } from "../src/config/data-source";
describe("POST /auth/register", () => {
    let connection: DataSource;

    beforeAll(async () => {
        connection = await AppDataSource.initialize();
    });

    beforeEach(async () => {
        await connection.dropDatabase();
        await connection.synchronize();
    });

    afterAll(async () => {
        await connection.destroy();
    });

    describe("Given all fields", () => {
        it("should persist the admin user in the database", async () => {
            const response = await createAdminUser();
            console.log(response);

            //Assert
            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();
            expect(users).toHaveLength(1);
            expect(users[0].role).toBe("admin");
        });
    });
});
