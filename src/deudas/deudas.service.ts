import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Deuda } from './deuda.entity';
import { EstadoDeuda } from './estado-deuda.enum';
import { CrearDeudaDto } from './dto/crear-deuda.dto';
import { ActualizarDeudaDto } from './dto/actualizar-deuda.dto';

export interface ProyeccionMes {
  mes: string;
  total: number;
}

@Injectable()
export class DeudasService {
  constructor(
    @InjectRepository(Deuda)
    private readonly deudasRepository: Repository<Deuda>,
  ) {}

  async crear(dto: CrearDeudaDto, usuarioId: number): Promise<Deuda> {
    const montoCuota = Number((dto.montoTotal / dto.cantidadCuotas).toFixed(2));
    const deuda = this.deudasRepository.create({ ...dto, montoCuota, usuarioId });
    return this.deudasRepository.save(deuda);
  }

  async findAll(usuarioId: number): Promise<Deuda[]> {
    return this.deudasRepository.findBy({ usuarioId });
  }

  async findOne(id: number, usuarioId: number): Promise<Deuda> {
    const deuda = await this.deudasRepository.findOneBy({ id });
    if (!deuda) throw new NotFoundException('Deuda no encontrada');
    if (deuda.usuarioId !== usuarioId) throw new ForbiddenException();
    return deuda;
  }

  async actualizar(id: number, dto: ActualizarDeudaDto, usuarioId: number): Promise<Deuda> {
    const deuda = await this.findOne(id, usuarioId);

    // Recalcular montoCuota si cambia montoTotal o cantidadCuotas
    const montoTotal = dto.montoTotal ?? Number(deuda.montoTotal);
    const cantidadCuotas = dto.cantidadCuotas ?? deuda.cantidadCuotas;
    const montoCuota = Number((montoTotal / cantidadCuotas).toFixed(2));

    await this.deudasRepository.update(id, { ...dto, montoCuota });
    return this.deudasRepository.findOneBy({ id }) as Promise<Deuda>;
  }

  async eliminar(id: number, usuarioId: number): Promise<void> {
    const deuda = await this.findOne(id, usuarioId);
    await this.deudasRepository.remove(deuda);
  }

  async proyeccion(usuarioId: number): Promise<ProyeccionMes[]> {
    const deudas = await this.deudasRepository.findBy({
      usuarioId,
      estado: EstadoDeuda.PENDIENTE,
    });

    // Construir mapa de los próximos 12 meses desde hoy
    const hoy = new Date();
    const totalesPorMes = new Map<string, number>();

    for (let i = 0; i < 12; i++) {
      const fecha = new Date(hoy.getFullYear(), hoy.getMonth() + i, 1);
      const clave = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;
      totalesPorMes.set(clave, 0);
    }

    for (const deuda of deudas) {
      const cuotasRestantes = deuda.cantidadCuotas - deuda.cuotasPagadas;
      if (cuotasRestantes <= 0) continue;

      // Mes de inicio: fechaVencimiento si existe, sino el mes actual
      const inicio = deuda.fechaVencimiento
        ? new Date(deuda.fechaVencimiento + 'T00:00:00')
        : new Date(hoy.getFullYear(), hoy.getMonth(), 1);

      for (let cuota = 0; cuota < cuotasRestantes; cuota++) {
        const mesCuota = new Date(inicio.getFullYear(), inicio.getMonth() + cuota, 1);
        const clave = `${mesCuota.getFullYear()}-${String(mesCuota.getMonth() + 1).padStart(2, '0')}`;

        if (totalesPorMes.has(clave)) {
          totalesPorMes.set(clave, totalesPorMes.get(clave)! + Number(deuda.montoCuota));
        }
      }
    }

    return Array.from(totalesPorMes.entries()).map(([mes, total]) => ({
      mes,
      total: Number(total.toFixed(2)),
    }));
  }
}
