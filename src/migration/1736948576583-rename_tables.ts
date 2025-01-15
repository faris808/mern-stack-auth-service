import { MigrationInterface, QueryRunner } from "typeorm";

export class RenameTables1736948576583 implements MigrationInterface {
    name = "RenameTables1736948576583";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.renameTable("user", "users");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "refreshTokens" DROP CONSTRAINT "FK_265bec4e500714d5269580a0219"`,
        );
        await queryRunner.renameTable("users", "user");
        await queryRunner.renameTable("refreshTokens", "refresh_token");
    }
}
