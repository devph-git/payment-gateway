import {MigrationInterface, QueryRunner} from "typeorm";

export class updateDefaultAddressAndPermissionFormat1594985394810 implements MigrationInterface {
    name = 'updateDefaultAddressAndPermissionFormat1594985394810'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "primary_address" SET DEFAULT '{"streetName":"","houseNumber":"","division":"","barangay":"","municipality":"","province":"","city":"","postalCode":"","country":""}'`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "secondary_address" SET DEFAULT '{"streetName":"","houseNumber":"","division":"","barangay":"","municipality":"","province":"","city":"","postalCode":"","country":""}'`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "permissions" SET DEFAULT '{"whiteList":[],"blackList":[]}'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "permissions" SET DEFAULT '{}'`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "secondary_address" SET DEFAULT '{}'`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "primary_address" SET DEFAULT '{}'`);
    }

}
