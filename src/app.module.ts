import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { UsuariosModule } from './usuarios/usuarios.module';
import { AuthModule } from './auth/auth.module';
import { GastosModule } from './gastos/gastos.module';
import { DeudasModule } from './deudas/deudas.module';
import { NotificacionesModule } from './notificaciones/notificaciones.module';
import { TarjetasModule } from './tarjetas/tarjetas.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: +configService.get<string>('DB_PORT')!,
        username: configService.get<string>('DB_USER'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: true,
      }),
      inject: [ConfigService],
    }),

    MulterModule.register({ limits: { fileSize: 10 * 1024 * 1024 } }),
    UsuariosModule,
    AuthModule,
    GastosModule,
    DeudasModule,
    NotificacionesModule,
    TarjetasModule,
  ],
})
export class AppModule {}