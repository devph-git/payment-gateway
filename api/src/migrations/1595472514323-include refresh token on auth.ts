import { MigrationInterface, QueryRunner } from 'typeorm';

export class includeRefreshTokenOnAuth1595472514323
  implements MigrationInterface {
  name = 'includeRefreshTokenOnAuth1595472514323';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user" ADD "refresh_token" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ALTER COLUMN "primary_address" SET DEFAULT '{}'`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ALTER COLUMN "secondary_address" SET DEFAULT '{}'`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ALTER COLUMN "permissions" SET DEFAULT '{"whiteList":[],"blackList":[]}'`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_d39749caee6b84266cc015329d" ON "user" ("refresh_token") WHERE "user"."refresh_token" IS NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" RENAME COLUMN "createdAt" TO "created_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" RENAME COLUMN "updatedAt" TO "updated_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "revoked_token" RENAME COLUMN "createdAt" TO "created_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "revoked_token" RENAME COLUMN "updatedAt" TO "updated_at"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_d39749caee6b84266cc015329d"`);
    await queryRunner.query(
      `ALTER TABLE "user" ALTER COLUMN "permissions" SET DEFAULT '{"blackList": [], "whiteList": []}'`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ALTER COLUMN "secondary_address" SET DEFAULT '{"city": "", "country": "", "barangay": "", "division": "", "province": "", "postalCode": "", "streetName": "", "houseNumber": "", "municipality": ""}'`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ALTER COLUMN "primary_address" SET DEFAULT '{"city": "", "country": "", "barangay": "", "division": "", "province": "", "postalCode": "", "streetName": "", "houseNumber": "", "municipality": ""}'`,
    );
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "refresh_token"`);
    await queryRunner.query(
      `ALTER TABLE "user" RENAME COLUMN "created_at" TO "createdAt"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" RENAME COLUMN "updated_at" TO "updatedAt"`,
    );
    await queryRunner.query(
      `ALTER TABLE "revoked_token" RENAME COLUMN "created_at" TO "createdAt"`,
    );
    await queryRunner.query(
      `ALTER TABLE "revoked_token" RENAME COLUMN "updated_at" TO "updatedAt"`,
    );
  }
}
