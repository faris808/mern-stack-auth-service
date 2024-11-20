import { DataSource } from "typeorm";
import { AppDataSource } from "../../src/config/data-source";
import request from "supertest";
import app from "../../src/app";
import bcrypt from "bcrypt";
import { User } from "../../src/entity/User";
import { Roles } from "../../src/constants";
import { isJwt } from "../utils";

describe("POST /auth/login", () => {
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
        it("should return the 200 status code", async () => {
            //Arrange
            const userData = {
                firstName: "Faris",
                lastName: "Z",
                email: "test@mern.space",
                password: "secreteee",
            };

            //Act
            const response = await request(app)
                .post("/auth/register")
                .send(userData);

            //Assert
            expect(response.statusCode).toBe(201);

            //Arrange
            const userData2 = {
                email: "test@mern.space",
                password: "secreteee",
            };

            //Act
            const response2 = await request(app)
                .post("/auth/login")
                .send(userData2);

            //Assert
            expect(response2.statusCode).toBe(200);
        });

        it("should return the valid json response", async () => {
            //Arrange
            const userData = {
                firstName: "Faris",
                lastName: "Z",
                email: "test@mern.space",
                password: "secreteee",
            };

            //Act
            const response = await request(app)
                .post("/auth/register")
                .send(userData);

            //Assert
            //If here error comes then write "as Record<string,string>" after response.headers
            expect(response.headers["content-type"]).toEqual(
                expect.stringContaining("json"),
            );

            //Arrange
            const userData2 = {
                email: "test@mern.space",
                password: "secreteee",
            };

            //Act
            const response2 = await request(app)
                .post("/auth/login")
                .send(userData2);

            //Assert
            //If here error comes then write "as Record<string,string>" after response.headers
            expect(response2.headers["content-type"]).toEqual(
                expect.stringContaining("json"),
            );
        });

        it("should return 400 status code if email or password is wrong", async () => {
            //Arrange
            const userData = {
                firstName: "Faris",
                lastName: "Z",
                email: "test@mern.space",
                password: "secreteee",
            };

            const hashedPassword = await bcrypt.hash(userData.password, 10);

            const userRepository = connection.getRepository(User);
            await userRepository.save({
                ...userData,
                password: hashedPassword,
                role: Roles.CUSTOMER,
            });

            // Act
            const response = await request(app)
                .post("/auth/login")
                .send({ email: userData.email, password: "wrongPassword" });

            // Assert
            expect(response.statusCode).toBe(400);
        });

        it("should return the access token and refresh token inside a cookie", async () => {
            //Arrange
            const userData = {
                firstName: "Faris",
                lastName: "Z",
                email: "test@mern.space",
                password: "secreteee",
            };

            const hashedPassword = await bcrypt.hash(userData.password, 10);

            const userRepository = connection.getRepository(User);
            await userRepository.save({
                ...userData,
                password: hashedPassword,
                role: Roles.CUSTOMER,
            });

            //Act
            const response = await request(app)
                .post("/auth/login")
                .send({ email: userData.email, password: userData.password });

            interface Headers {
                ["set-cookie"]: string[];
            }

            //Assert
            let accessToken = null;
            let refreshToken = null;
            const cookies =
                (response.headers as unknown as Headers)["set-cookie"] || [];
            cookies.forEach((cookie) => {
                if (cookie.startsWith("accessToken=")) {
                    accessToken = cookie.split(";")[0].split("=")[1];
                }
                if (cookie.startsWith("refreshToken=")) {
                    refreshToken = cookie.split(";")[0].split("=")[1];
                }
            });

            expect(accessToken).not.toBeNull();
            expect(refreshToken).not.toBeNull();

            expect(isJwt(accessToken)).toBeTruthy();
            expect(isJwt(refreshToken)).toBeTruthy();
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
