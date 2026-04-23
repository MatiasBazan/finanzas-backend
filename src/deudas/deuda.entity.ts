import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Usuario } from '../usuarios/usuario.entity';
import { EstadoDeuda } from './estado-deuda.enum';

@Entity('deudas')
export class Deuda {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  descripcion: string;

  @Column('decimal', { precision: 10, scale: 2 })
  montoTotal: number;

  @Column('int')
  cantidadCuotas: number;

  @Column('int', { default: 0 })
  cuotasPagadas: number;

  @Column('decimal', { precision: 10, scale: 2 })
  montoCuota: number;

  @Column({ type: 'date', nullable: true })
  fechaVencimiento: string | null;

  @Column({ type: 'enum', enum: EstadoDeuda, default: EstadoDeuda.PENDIENTE })
  estado: EstadoDeuda;

  @CreateDateColumn()
  creadoEn: Date;

  @ManyToOne(() => Usuario, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'usuarioId' })
  usuario: Usuario;

  @Column()
  usuarioId: number;
}
