import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('usuarios')
export class Usuario {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  nombre: string;

  @Column()
  password: string;

  @Column({ nullable: true, type: 'varchar' })
  telefono: string | null;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  limiteMensual: number | null;

  @CreateDateColumn()
  creadoEn: Date;
}
