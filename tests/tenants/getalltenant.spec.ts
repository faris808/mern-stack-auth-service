import { DataSource } from "typeorm";
import { AppDataSource } from "../../src/config/data-source";
import request from "supertest";
import app from "../../src/app";
import createJWKSMock from "mock-jwks";
import { Roles } from "../../src/constants";

describe("GET /tenants", () => {
    let connection: DataSource;
    let jwks: ReturnType<typeof createJWKSMock>;
    let adminToken: string;

    beforeAll(async () => {
        jwks = createJWKSMock("http://localhost:5501");
        connection = await AppDataSource.initialize();
    });

    beforeEach(async () => {
        jwks.start();
        await connection.dropDatabase();
        await connection.synchronize();

        adminToken = jwks.token({
            sub: "1",
            role: Roles.ADMIN,
        });
    });

    afterEach(() => {
        jwks.stop();
    });

    afterAll(async () => {
        await connection.destroy();
    });

    describe("Given all fields", () => {
        it("should return a 200 status code", async () => {
            //Arrange
            const tenantData1 = {
                name: "Tenant Name 1",
                address: "Tenant Address 1",
            };

            const tenantData2 = {
                name: "Tenant Name 2",
                address: "Tenant Address 2",
            };

            //Act
            await request(app)
                .post("/tenants")
                .set("Cookie", [`accessToken=${adminToken}`])
                .send(tenantData1);

            await request(app)
                .post("/tenants")
                .set("Cookie", [`accessToken=${adminToken}`])
                .send(tenantData2);

            const response = await request(app)
                .get("/tenants")
                .set("Cookie", [`accessToken=${adminToken}`])
                .send();

            console.log(response.body);

            expect(response.statusCode).toBe(200);
            expect(response.body.data).toHaveLength(2);
        });
    });
});
