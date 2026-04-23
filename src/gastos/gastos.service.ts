import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Gasto } from './gasto.entity';
import { CrearGastoDto } from './dto/crear-gasto.dto';
import { ActualizarGastoDto } from './dto/actualizar-gasto.dto';

@Injectable()
export class GastosService {
  constructor(
    @InjectRepository(Gasto)
    private readonly gastosRepository: Repository<Gasto>,
  ) {}

  async crear(dto: CrearGastoDto, usuarioId: number): Promise<Gasto> {
    const gasto = this.gastosRepository.create({ ...dto, usuarioId });
    return this.gastosRepository.save(gasto);
  }

  async findAll(usuarioId: number): Promise<Gasto[]> {
    return this.gastosRepository.findBy({ usuarioId });
  }

  async findOne(id: number, usuarioId: number): Promise<Gasto> {
    const gasto = await this.gastosRepository.findOneBy({ id });
    if (!gasto) throw new NotFoundException('Gasto no encontrado');
    if (gasto.usuarioId !== usuarioId) throw new ForbiddenException();
    return gasto;
  }

  async actualizar(id: number, dto: ActualizarGastoDto, usuarioId: number): Promise<Gasto> {
    await this.findOne(id, usuarioId);
    await this.gastosRepository.update(id, dto);
    return this.gastosRepository.findOneBy({ id }) as Promise<Gasto>;
  }

  async eliminar(id: number, usuarioId: number): Promise<void> {
    const gasto = await this.findOne(id, usuarioId);
    await this.gastosRepository.remove(gasto);
  }
}
