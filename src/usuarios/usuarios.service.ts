import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Usuario } from './usuario.entity';
import { CreateUsuarioDto } from './dto/create-usuario.dto';

@Injectable()
export class UsuariosService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuariosRepository: Repository<Usuario>,
  ) {}

  async crear(dto: CreateUsuarioDto): Promise<Omit<Usuario, 'password'>> {
    const existe = await this.usuariosRepository.findOneBy({ email: dto.email });
    if (existe) throw new ConflictException('El email ya está registrado');

    const hash = await bcrypt.hash(dto.password, 10);
    const usuario = this.usuariosRepository.create({ ...dto, password: hash });
    const guardado = await this.usuariosRepository.save(usuario);

    const { password, ...resultado } = guardado;
    return resultado;
  }

  async findByEmail(email: string): Promise<Usuario | null> {
    return this.usuariosRepository.findOneBy({ email });
  }

  async findAll(): Promise<Omit<Usuario, 'password'>[]> {
    const usuarios = await this.usuariosRepository.find();
    return usuarios.map(({ password, ...u }) => u);
  }

  async findOne(id: number): Promise<Omit<Usuario, 'password'>> {
    const usuario = await this.usuariosRepository.findOneBy({ id });
    if (!usuario) throw new NotFoundException('Usuario no encontrado');
    const { password, ...resultado } = usuario;
    return resultado;
  }
}
