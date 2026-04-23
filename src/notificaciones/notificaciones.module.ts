import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificacionesService } from './notificaciones.service';
import { Deuda } from '../deudas/deuda.entity';
import { Gasto } from '../gastos/gasto.entity';
import { Usuario } from '../usuarios/usuario.entity';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    TypeOrmModule.forFeature([Deuda, Gasto, Usuario]),
  ],
  providers: [NotificacionesService],
})
export class NotificacionesModule {}
