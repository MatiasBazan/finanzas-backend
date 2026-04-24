import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';
import { Rol } from '../auth/rol.enum';

@Entity('usuarios')
export class Usuario {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  nombre: string;

  @Column({ select: false })
  password: string;

  @Column({ nullable: true, type: 'varchar' })
  telefono: string | null;

  @Column({ type: 'enum', enum: Rol, default: Rol.USUARIO })
  rol: Rol;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  limiteMensual: number | null;

  @CreateDateColumn()
  creadoEn: Date;
}
