import { DataSource } from "typeorm";
import { AppDataSource } from "../../src/config/data-source";
import createJWKSMock from "mock-jwks";
import request from "supertest";
import app from "../../src/app";
import { Roles } from "../../src/constants";
import { createTenant } from "../utils";
import { Tenant } from "../../src/entity/Tenant";

describe("GET /users", () => {
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
            const tenant1 = await createTenant(
                connection.getRepository(Tenant),
            );
            const tenant2 = await createTenant(
                connection.getRepository(Tenant),
            );
            //Register a user
            const userData1 = {
                firstName: "Faris",
                lastName: "Z",
                email: "test@mern.space",
                password: "secreteee",
                role: Roles.MANAGER,
                tenantId: tenant1.id,
            };

            const userData2 = {
                firstName: "Faris2",
                lastName: "Z2",
                email: "test@mern2.space",
                password: "secreteee2",
                role: Roles.MANAGER,
                tenantId: tenant2.id,
            };

            const adminToken = jwks.token({
                sub: "1",
                role: Roles.ADMIN,
            });

            //Add token to cookie
            await request(app)
                .post("/users")
                .set("Cookie", [`accessToken=${adminToken}`])
                .send(userData1);

            await request(app)
                .post("/users")
                .set("Cookie", [`accessToken=${adminToken}`])
                .send(userData2);

            const response = await request(app)
                .get("/users")
                .set("Cookie", [`accessToken=${adminToken}`])
                .send();

            expect(response.statusCode).toBe(200);
            expect(response.body).toHaveLength(2);
        });
    });
});
