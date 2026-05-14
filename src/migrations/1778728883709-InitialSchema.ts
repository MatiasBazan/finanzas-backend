import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1778728883709 implements MigrationInterface {
    name = 'InitialSchema1778728883709'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`usuarios\` (\`id\` int NOT NULL AUTO_INCREMENT, \`email\` varchar(255) NOT NULL, \`nombre\` varchar(255) NOT NULL, \`password\` varchar(255) NOT NULL, \`telefono\` varchar(255) NULL, \`rol\` enum ('admin', 'usuario') NOT NULL DEFAULT 'usuario', \`limiteMensual\` decimal(10,2) NULL, \`creadoEn\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_446adfc18b35418aac32ae0b7b\` (\`email\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`tarjetas_resumenes\` (\`id\` int NOT NULL AUTO_INCREMENT, \`nombre\` varchar(255) NOT NULL, \`banco\` varchar(255) NOT NULL, \`saldoActual\` decimal(12,2) NOT NULL, \`saldoDolares\` decimal(10,2) NULL, \`vencimiento\` date NOT NULL, \`pagoMinimo\` decimal(12,2) NOT NULL, \`cierreActual\` date NULL, \`cuotasAVencer\` json NOT NULL, \`fechaImportacion\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`usuarioId\` int NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`deudas\` (\`id\` int NOT NULL AUTO_INCREMENT, \`descripcion\` varchar(255) NOT NULL, \`montoTotal\` decimal(10,2) NOT NULL, \`cantidadCuotas\` int NOT NULL, \`cuotasPagadas\` int NOT NULL DEFAULT '0', \`montoCuota\` decimal(10,2) NOT NULL, \`fechaVencimiento\` date NULL, \`estado\` enum ('pendiente', 'pagado', 'vencido') NOT NULL DEFAULT 'pendiente', \`creadoEn\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`usuarioId\` int NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`gastos\` (\`id\` int NOT NULL AUTO_INCREMENT, \`monto\` decimal(10,2) NOT NULL, \`categoria\` enum ('supermercado', 'verduleria', 'ropa', 'tecnologia', 'viajes', 'salud', 'transporte', 'entretenimiento') NOT NULL, \`descripcion\` varchar(255) NULL, \`fecha\` date NOT NULL, \`pagado\` tinyint NOT NULL DEFAULT 0, \`creadoEn\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`usuarioId\` int NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`tarjetas_resumenes\` ADD CONSTRAINT \`FK_2aa56d36ad7136c5a9c4550eef5\` FOREIGN KEY (\`usuarioId\`) REFERENCES \`usuarios\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`deudas\` ADD CONSTRAINT \`FK_5413d1a40c4d1f34ddb6a4a343a\` FOREIGN KEY (\`usuarioId\`) REFERENCES \`usuarios\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`gastos\` ADD CONSTRAINT \`FK_03b9b6f9ce55fecf2d88be7d82c\` FOREIGN KEY (\`usuarioId\`) REFERENCES \`usuarios\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`gastos\` DROP FOREIGN KEY \`FK_03b9b6f9ce55fecf2d88be7d82c\``);
        await queryRunner.query(`ALTER TABLE \`deudas\` DROP FOREIGN KEY \`FK_5413d1a40c4d1f34ddb6a4a343a\``);
        await queryRunner.query(`ALTER TABLE \`tarjetas_resumenes\` DROP FOREIGN KEY \`FK_2aa56d36ad7136c5a9c4550eef5\``);
        await queryRunner.query(`DROP TABLE \`gastos\``);
        await queryRunner.query(`DROP TABLE \`deudas\``);
        await queryRunner.query(`DROP TABLE \`tarjetas_resumenes\``);
        await queryRunner.query(`DROP INDEX \`IDX_446adfc18b35418aac32ae0b7b\` ON \`usuarios\``);
        await queryRunner.query(`DROP TABLE \`usuarios\``);
    }

}
