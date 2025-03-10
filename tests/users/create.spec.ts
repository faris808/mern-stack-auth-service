import { DataSource } from "typeorm";
import { AppDataSource } from "../../src/config/data-source";
import createJWKSMock from "mock-jwks";
import request from "supertest";
import app from "../../src/app";
import { User } from "../../src/entity/User";
import { Roles } from "../../src/constants";
import { createTenant } from "../utils";
import { Tenant } from "../../src/entity/Tenant";

describe("POST /users", () => {
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
        it("should persist the user in the database", async () => {
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

            const userRespository = connection.getRepository(User);
            const users = await userRespository.find();

            expect(users).toHaveLength(1);
            expect(users[0].email).toBe(userData.email);
        });

        it("should create a manager user", async () => {
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

            const userRespository = connection.getRepository(User);
            const users = await userRespository.find();

            expect(users).toHaveLength(1);
            expect(users[0].role).toBe(Roles.MANAGER);
        });

        it("should return 403 if non-admin tries to create a user", async () => {
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

            const managerToken = jwks.token({
                sub: "1",
                role: Roles.MANAGER,
            });

            //Add token to cookie
            const response = await request(app)
                .post("/users")
                .set("Cookie", [`accessToken=${managerToken}`])
                .send(userData);

            expect(response.statusCode).toBe(403);
        });
    });
});
