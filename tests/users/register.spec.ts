import request from "supertest";
import app from "../../src/app";
describe("POST /auth/register", () => {
    describe("Given all fields", () => {
        it("should return the 201 status code", async () => {
            //Arrange
            const userData = {
                firstName: "Faris",
                lastName: "Z",
                email: "test@mern.space",
                password: "secret",
            };

            //Act
            const response = await request(app)
                .post("/auth/register")
                .send(userData);

            //Assert
            expect(response.statusCode).toBe(201);
        });

        it("should return the valid json response", async () => {
            //Arrange
            const userData = {
                firstName: "Faris",
                lastName: "Z",
                email: "test@mern.space",
                password: "secret",
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
        });

        it("should persist the user in the database", async () => {
            //Arrange
            const userData = {
                firstName: "Faris",
                lastName: "Z",
                email: "test@mern.space",
                password: "secret",
            };

            //Act
            await request(app).post("/auth/register").send(userData);

            //Assert
        });
    });

    describe("Fields are missing", () => {});
});
