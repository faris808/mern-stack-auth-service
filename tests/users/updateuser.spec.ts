import { DataSource } from "typeorm";
import { AppDataSource } from "../../src/config/data-source";
import createJWKSMock from "mock-jwks";
import request from "supertest";
import app from "../../src/app";
import { Roles } from "../../src/constants";
import { createTenant } from "../utils";
import { Tenant } from "../../src/entity/Tenant";
import { User } from "../../src/entity/User";

describe("UPDATE /users/:id", () => {
    let connection: DataSource;
    let jwks: ReturnType<typeof createJWKSMock>;

    beforeAll(async () => {
        jwks = createJWKSMock("http://localhost:5501");
        connection = await AppDataSource.initialize();
    });

    beforeEach(async () => {
        jwks.start();
        await connection.dropDatabase();
        await connection.synchronize();
    });

    afterEach(() => {
        jwks.stop();
    });

    afterAll(async () => {
        await connection.destroy();
    });

    describe("Given all fields", () => {
        it("should return the 200 status code", async () => {
            const tenant = await createTenant(connection.getRepository(Tenant));
            //Register a user
            const userData = {
                firstName: "Faris",
                lastName: "Z",
                email: "test@mern.space",
                password: "secreteee",
                role: Roles.MANAGER,
                tenantId: tenant.id,
            };

            const adminToken = jwks.token({
                sub: "1",
                role: Roles.ADMIN,
            });

            //Add token to cookie
            await request(app)
                .post("/users")
                .set("Cookie", [`accessToken=${adminToken}`])
                .send(userData);

            const userRepository = connection.getRepository(User);
            const userid = await userRepository.find({
                select: ["id"],
            });

            const updatedUserData = {
                firstName: "New Faris",
                lastName: "New Z",
                role: Roles.MANAGER,
            };

            const response = await request(app)
                .patch(`/users/${userid[0].id}`)
                .set("Cookie", [`accessToken=${adminToken}`])
                .send(updatedUserData);

            expect(response.statusCode).toBe(200);
            const users = await userRepository.find();

            //Assert
            expect(users).toHaveLength(1);
            expect(users[0].firstName).toBe(updatedUserData.firstName);
            expect(users[0].lastName).toBe(updatedUserData.lastName);
            expect(users[0].role).toBe(updatedUserData.role);
        });
    });
});
