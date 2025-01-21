import { DataSource } from "typeorm";
import { AppDataSource } from "../../src/config/data-source";
import request from "supertest";
import app from "../../src/app";
import { Tenant } from "../../src/entity/Tenant";
import createJWKSMock from "mock-jwks";
import { Roles } from "../../src/constants";

describe("DELETE /tenants/:id", () => {
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
            const tenantData = {
                name: "Tenant Name",
                address: "Tenant Address",
            };

            //Act
            const response = await request(app)
                .post("/tenants")
                .set("Cookie", [`accessToken=${adminToken}`])
                .send(tenantData);

            //Assert
            expect(response.statusCode).toBe(201);

            const tenantRepository = connection.getRepository(Tenant);
            const tenantid = await tenantRepository.find({
                select: ["id"],
            });

            const response2 = await request(app)
                .delete(`/tenants/${tenantid[0].id}`)
                .set("Cookie", [`accessToken=${adminToken}`])
                .send();

            expect(response2.statusCode).toBe(200);
            const tenants = await tenantRepository.find();

            //Assert
            expect(tenants).toHaveLength(0);
        });

        it("should return 401 if user is not authenticated", async () => {
            //Arrange
            const tenantData = {
                name: "Tenant Name",
                address: "Tenant Address",
            };

            //Act
            const response = await request(app)
                .post("/tenants")
                .set("Cookie", [`accessToken=${adminToken}`])
                .send(tenantData);

            //Assert
            expect(response.statusCode).toBe(201);

            const tenantRepository = connection.getRepository(Tenant);
            const tenantid = await tenantRepository.find({
                select: ["id"],
            });

            //Act
            const response2 = await request(app)
                .delete(`/tenants/${tenantid[0].id}`)
                .send();

            expect(response2.statusCode).toBe(401);
        });

        it("should return 403 if user is not an admin", async () => {
            //Arrange
            const managerToken = jwks.token({
                sub: "1",
                role: Roles.MANAGER,
            });

            //Arrange
            const tenantData = {
                name: "Tenant Name",
                address: "Tenant Address",
            };

            //Act
            const response = await request(app)
                .post("/tenants")
                .set("Cookie", [`accessToken=${adminToken}`])
                .send(tenantData);

            //Assert
            expect(response.statusCode).toBe(201);

            const tenantRepository = connection.getRepository(Tenant);
            const tenantid = await tenantRepository.find({
                select: ["id"],
            });

            //Act
            const response2 = await request(app)
                .delete(`/tenants/${tenantid[0].id}`)
                .set("Cookie", [`accessToken=${managerToken}`])
                .send();

            expect(response2.statusCode).toBe(403);
        });
    });

    describe("Fields are missing", () => {
        it("should return 400 status code if name field is missing", async () => {
            //Arrange
            const tenantData = {
                name: "Tenant Name",
                address: "Tenant Address",
            };

            //Act
            const response = await request(app)
                .post("/tenants")
                .set("Cookie", [`accessToken=${adminToken}`])
                .send(tenantData);

            //Assert
            expect(response.statusCode).toBe(201);

            const tenantRepository = connection.getRepository(Tenant);
            const tenantid = await tenantRepository.find({
                select: ["id"],
            });

            const updatedTenantData = {
                name: "",
                address: "New Tenant Address",
            };

            //Act
            const response2 = await request(app)
                .patch(`/tenants/${tenantid[0].id}`)
                .set("Cookie", [`accessToken=${adminToken}`])
                .send(updatedTenantData);

            //Assert
            expect(response2.statusCode).toBe(400);
        });
    });
});
