import { DataSource, Repository } from "typeorm";
import { Tenant } from "../../src/entity/Tenant";

export const truncateTables = async (connection: DataSource) => {
    const entities = connection.entityMetadatas;
    for (const entity of entities) {
        const repository = connection.getRepository(entity.name);
        await repository.clear();
    }
};

export const isJwt = (token: string | null): boolean => {
    if (token === null) {
        return false;
    }
    const parts = token.split(".");
    if (parts.length !== 3) {
        return false;
    }

    try {
        parts.forEach((part) => {
            Buffer.from(part, "base64").toString("utf-8");
        });
        return true;
    } catch (err) {
        if (err instanceof Error) {
            console.error(
                "Error occurred while validating parts:",
                err.message,
            );
        } else {
            console.error("An unknown error occurred:", err);
        }
        // Optionally, you can perform additional actions based on the error
        return false;
    }
};

export const createTenant = async (repository: Repository<Tenant>) => {
    const tenant = await repository.save({
        name: "Tenant Name",
        address: "Tenant Address",
    });
    return tenant;
};
