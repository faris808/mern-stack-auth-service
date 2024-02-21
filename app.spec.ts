import request from "supertest";
import app from "./src/app";
import { calculatedDiscount } from "./src/utils";

describe.skip("App", () => {
    it("It should calculate the discount", () => {
        const result = calculatedDiscount(100, 10);
        expect(result).toBe(10);
    });

    it("Should return 200 status", async () => {
        const response = await request(app).get("/").send();
        expect(response.statusCode).toBe(200);
    });
});
