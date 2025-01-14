import { DataSource } from "typeorm";
import { AppDataSource } from "../../src/config/data-source";
import createJWKSMock from "mock-jwks";
import request from "supertest";
import app from "../../src/app";

describe("POST /auth/refresh", () => {
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
            const refreshToken =
                "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2Iiwicm9sZSI6ImN1c3RvbWVyIiwiaWQiOiIzMiIsImlhdCI6MTczNjc3NTU5NCwiZXhwIjoxNzY4MzMzMTk0LCJpc3MiOiJhdXRoLXNlcnZpY2UiLCJqdGkiOiIzMiJ9.sNwhnX4IY025QYH6WG2FZrmMyR6WCLOhp6PGE1YI6xk";

            const authdata = {
                auth: {
                    sub: "4",
                    role: "customer",
                    id: "25",
                    iat: 1736770744,
                    exp: 1768328344,
                    iss: "auth-service",
                    jti: "25",
                },
            };
            const response = await request(app)
                .post("/auth/refresh")
                .set("Cookie", [`refreshToken=${refreshToken}`])
                .send(authdata);
            expect(response.statusCode).toBe(200);
        });
    });
});
