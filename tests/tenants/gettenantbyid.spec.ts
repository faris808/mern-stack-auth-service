import { DataSource } from "typeorm";
import { AppDataSource } from "../../src/config/data-source";
import request from "supertest";
import app from "../../src/app";
import createJWKSMock from "mock-jwks";
import { Roles } from "../../src/constants";

describe("GET /tenants/:id", () => {
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
            const response1 = await request(app)
                .post("/tenants")
                .set("Cookie", [`accessToken=${adminToken}`])
                .send(tenantData1);

            const response2 = await request(app)
                .post("/tenants")
                .set("Cookie", [`accessToken=${adminToken}`])
                .send(tenantData2);

            expect(response1.statusCode).toBe(201);
            expect(response2.statusCode).toBe(201);
            type tenantcreateresponse = {
                id: number;
            };

            const response3 = await request(app)
                .get(`/tenants/${(response1.body as tenantcreateresponse).id}`)
                .set("Cookie", [`accessToken=${adminToken}`])
                .send();

            expect(response3.statusCode).toBe(200);
            expect((response3.body as Record<string, string>).name).toBe(
                tenantData1.name,
            );
            expect((response3.body as Record<string, string>).address).toBe(
                tenantData1.address,
            );
        });

        it("should return 400 status code if tenant does not exist", async () => {
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
            const response1 = await request(app)
                .post("/tenants")
                .set("Cookie", [`accessToken=${adminToken}`])
                .send(tenantData1);

            const response2 = await request(app)
                .post("/tenants")
                .set("Cookie", [`accessToken=${adminToken}`])
                .send(tenantData2);

            expect(response1.statusCode).toBe(201);
            expect(response2.statusCode).toBe(201);
            const response3 = await request(app)
                .get(`/tenants/5`)
                .set("Cookie", [`accessToken=${adminToken}`])
                .send();

            expect(response3.statusCode).toBe(400);
        });
    });
});
