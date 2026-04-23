import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TarjetasController } from './tarjetas.controller';
import { TarjetasService } from './tarjetas.service';
import { TarjetaResumen } from './tarjeta-resumen.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TarjetaResumen])],
  controllers: [TarjetasController],
  providers: [TarjetasService],
})
export class TarjetasModule {}
