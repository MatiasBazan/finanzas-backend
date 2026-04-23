import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Usuario } from '../usuarios/usuario.entity';
import { Categoria } from './categoria.enum';

@Entity('gastos')
export class Gasto {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('decimal', { precision: 10, scale: 2 })
  monto: number;

  @Column({ type: 'enum', enum: Categoria })
  categoria: Categoria;

  @Column({ nullable: true, type: 'varchar' })
  descripcion: string | null;

  @Column({ type: 'date' })
  fecha: string;

  @Column({ default: false })
  pagado: boolean;

  @CreateDateColumn()
  creadoEn: Date;

  @ManyToOne(() => Usuario, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'usuarioId' })
  usuario: Usuario;

  @Column()
  usuarioId: number;
}
