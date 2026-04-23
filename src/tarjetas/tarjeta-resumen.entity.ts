import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Usuario } from '../usuarios/usuario.entity';

@Entity('tarjetas_resumenes')
export class TarjetaResumen {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombre: string;

  @Column()
  banco: string;

  @Column('decimal', { precision: 12, scale: 2 })
  saldoActual: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  saldoDolares: number | null;

  @Column({ type: 'date' })
  vencimiento: string;

  @Column('decimal', { precision: 12, scale: 2 })
  pagoMinimo: number;

  @Column({ type: 'date', nullable: true })
  cierreActual: string | null;

  @Column({ type: 'jsonb' })
  cuotasAVencer: { mes: string; total: number }[];

  @CreateDateColumn()
  fechaImportacion: Date;

  @ManyToOne(() => Usuario, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'usuarioId' })
  usuario: Usuario;

  @Column()
  usuarioId: number;
}
