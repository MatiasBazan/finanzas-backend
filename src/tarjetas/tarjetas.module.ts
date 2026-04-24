import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { TarjetasController } from './tarjetas.controller';
import { TarjetasService } from './tarjetas.service';
import { TarjetaResumen } from './tarjeta-resumen.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([TarjetaResumen]),
    MulterModule.register({ limits: { fileSize: 10 * 1024 * 1024 } }),
  ],
  controllers: [TarjetasController],
  providers: [TarjetasService],
})
export class TarjetasModule {}
