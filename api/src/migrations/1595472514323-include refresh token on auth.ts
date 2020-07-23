import {MigrationInterface, QueryRunner} from "typeorm";

export class includeRefreshTokenOnAuth1595472514323 implements MigrationInterface {
    name = 'includeRefreshTokenOnAuth1595472514323'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ADD "refreshToken" character varying`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "primary_address" SET DEFAULT '{}'`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "secondary_address" SET DEFAULT '{}'`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "permissions" SET DEFAULT '{"whiteList":[],"blackList":[]}'`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_d39749caee6b84266cc015329d" ON "user" ("refreshToken") WHERE "user"."refreshToken" IS NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "IDX_d39749caee6b84266cc015329d"`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "permissions" SET DEFAULT '{"blackList": [], "whiteList": []}'`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "secondary_address" SET DEFAULT '{"city": "", "country": "", "barangay": "", "division": "", "province": "", "postalCode": "", "streetName": "", "houseNumber": "", "municipality": ""}'`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "primary_address" SET DEFAULT '{"city": "", "country": "", "barangay": "", "division": "", "province": "", "postalCode": "", "streetName": "", "houseNumber": "", "municipality": ""}'`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "refreshToken"`);
    }

}
