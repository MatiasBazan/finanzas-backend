import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { UsuariosModule } from './usuarios/usuarios.module';
import { AuthModule } from './auth/auth.module';
import { GastosModule } from './gastos/gastos.module';
import { DeudasModule } from './deudas/deudas.module';
import { NotificacionesModule } from './notificaciones/notificaciones.module';
import { TarjetasModule } from './tarjetas/tarjetas.module';
import { HealthModule } from './health/health.module';
import { envValidationSchema } from './config/env.validation';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      validationSchema: envValidationSchema,
      validationOptions: { abortEarly: true },
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USER'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        migrations: [__dirname + '/migrations/*{.ts,.js}'],
        migrationsTableName: 'migrations',
        migrationsRun: true,
        synchronize: false,
        logging: configService.get<string>('NODE_ENV') !== 'production',
      }),
      inject: [ConfigService],
    }),

    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: () => [
        { name: 'short', ttl: 1000, limit: 10 },
        { name: 'medium', ttl: 10000, limit: 50 },
        { name: 'long', ttl: 60000, limit: 100 },
      ],
      inject: [ConfigService],
    }),

    UsuariosModule,
    AuthModule,
    GastosModule,
    DeudasModule,
    NotificacionesModule,
    TarjetasModule,
    HealthModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
