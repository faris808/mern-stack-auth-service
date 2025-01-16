import { DataSource } from "typeorm";
import { AppDataSource } from "../../src/config/data-source";
import request from "supertest";
import app from "../../src/app";
import { Tenant } from "../../src/entity/Tenant";
import createJWKSMock from "mock-jwks";
import { Roles } from "../../src/constants";

describe("POST /tenants", () => {
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
        it("should return a 201 status code", async () => {
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
        });

        it("should create tenant in the database", async () => {
            //Arrange
            const tenantData = {
                name: "Tenant Name",
                address: "Tenant Address",
            };

            //Act
            await request(app)
                .post("/tenants")
                .set("Cookie", [`accessToken=${adminToken}`])
                .send(tenantData);

            const tenantRepository = connection.getRepository(Tenant);
            const tenants = await tenantRepository.find();

            //Assert
            expect(tenants).toHaveLength(1);
            expect(tenants[0].name).toBe(tenantData.name);
            expect(tenants[0].address).toBe(tenantData.address);
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
                .send(tenantData);
            expect(response.statusCode).toBe(401);

            const tenantRepository = connection.getRepository(Tenant);
            const tenants = await tenantRepository.find();

            //Assert
            expect(tenants).toHaveLength(0);
        });
    });

    describe("Fields are missing", () => {
        it("should return 400 status code if email field is missing", async () => {
            //Arrange
            const userData = {
                email: "",
                password: "secreteee",
            };

            //Act
            const response = await request(app)
                .post("/auth/login")
                .send(userData);

            //Assert
            expect(response.statusCode).toBe(400);
        });

        it("should return 400 status code if password is missing", async () => {
            //Arrange
            const userData = {
                email: "test@mern.space",
                password: "",
            };

            //Act
            const response = await request(app)
                .post("/auth/login")
                .send(userData);

            //Assert
            expect(response.statusCode).toBe(400);
        });
    });

    describe("Fields are not in proper format", () => {
        it("should trim the email field", async () => {
            //Arrange
            const userData = {
                firstName: "Faris",
                lastName: "Z",
                email: "  example@example.com   ",
                password: "secreteee",
            };

            //Act
            await request(app).post("/auth/register").send(userData);

            //Arrange
            const userData2 = {
                email: "example@example.com",
                password: "secreteee",
            };

            //Act
            const response2 = await request(app)
                .post("/auth/login")
                .send(userData2);

            //Assert
            expect(response2.statusCode).toBe(200);
        });
    });
});
