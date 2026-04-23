import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import * as twilio from 'twilio';
import { Deuda } from '../deudas/deuda.entity';
import { Gasto } from '../gastos/gasto.entity';
import { Usuario } from '../usuarios/usuario.entity';
import { EstadoDeuda } from '../deudas/estado-deuda.enum';

@Injectable()
export class NotificacionesService {
  private readonly logger = new Logger(NotificacionesService.name);
  private readonly twilioClient: twilio.Twilio | null = null;
  private readonly from: string;

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(Deuda)
    private readonly deudasRepository: Repository<Deuda>,
    @InjectRepository(Gasto)
    private readonly gastosRepository: Repository<Gasto>,
    @InjectRepository(Usuario)
    private readonly usuariosRepository: Repository<Usuario>,
  ) {
    const sid = this.configService.get<string>('TWILIO_ACCOUNT_SID');
    const token = this.configService.get<string>('TWILIO_AUTH_TOKEN');
    this.from = this.configService.get<string>('TWILIO_WHATSAPP_FROM', 'whatsapp:+14155238886');

    if (sid && token) {
      try {
        this.twilioClient = twilio.default(sid, token);
        this.logger.log('Cliente Twilio inicializado correctamente');
      } catch {
        this.logger.warn(
          'Credenciales Twilio inválidas — notificaciones WhatsApp deshabilitadas',
        );
      }
    } else {
      this.logger.warn(
        'TWILIO_ACCOUNT_SID o TWILIO_AUTH_TOKEN no definidos — notificaciones WhatsApp deshabilitadas',
      );
    }
  }

  async enviarMensajeWhatsapp(telefono: string, mensaje: string): Promise<void> {
    if (!this.twilioClient) {
      this.logger.warn(`[WhatsApp deshabilitado] Para: ${telefono} | Mensaje: ${mensaje}`);
      return;
    }

    try {
      await this.twilioClient.messages.create({
        from: this.from,
        to: `whatsapp:${telefono}`,
        body: mensaje,
      });
      this.logger.log(`WhatsApp enviado a ${telefono}`);
    } catch (error) {
      this.logger.error(`Error al enviar WhatsApp a ${telefono}: ${(error as Error).message}`);
    }
  }

  @Cron('0 9 * * *')
  async verificarDeudasPorVencer(): Promise<void> {
    this.logger.log('Cron: verificando deudas próximas a vencer...');

    const hoy = new Date();
    const en7Dias = new Date();
    en7Dias.setDate(hoy.getDate() + 7);

    const formatoFecha = (d: Date) => d.toISOString().split('T')[0];

    const deudas = await this.deudasRepository.find({
      where: {
        estado: EstadoDeuda.PENDIENTE,
        fechaVencimiento: Between(formatoFecha(hoy), formatoFecha(en7Dias)),
      },
      relations: ['usuario'],
    });

    this.logger.log(`Deudas por vencer encontradas: ${deudas.length}`);

    for (const deuda of deudas) {
      const { usuario } = deuda;
      if (!usuario.telefono) continue;

      const mensaje =
        `Hola ${usuario.nombre}, tu deuda '${deuda.descripcion}' vence el ${deuda.fechaVencimiento}. ` +
        `Monto: $${Number(deuda.montoCuota).toFixed(2)}`;

      await this.enviarMensajeWhatsapp(usuario.telefono, mensaje);
    }
  }

  @Cron('0 8 1 * *')
  async verificarLimiteMensual(): Promise<void> {
    this.logger.log('Cron: verificando límites mensuales de gasto...');

    const usuarios = await this.usuariosRepository
      .createQueryBuilder('usuario')
      .where('usuario.limiteMensual IS NOT NULL')
      .getMany();

    this.logger.log(`Usuarios con límite mensual: ${usuarios.length}`);

    const hoy = new Date();
    const primerDiaMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    const ultimoDiaMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);

    const formatoFecha = (d: Date) => d.toISOString().split('T')[0];

    for (const usuario of usuarios) {
      if (!usuario.telefono || !usuario.limiteMensual) continue;

      const gastos = await this.gastosRepository.find({
        where: {
          usuarioId: usuario.id,
          fecha: Between(formatoFecha(primerDiaMes), formatoFecha(ultimoDiaMes)),
        },
      });

      const total = gastos.reduce((suma, g) => suma + Number(g.monto), 0);
      const limite = Number(usuario.limiteMensual);

      if (total >= limite * 0.8) {
        const mensaje =
          `Hola ${usuario.nombre}, llevás gastado $${total.toFixed(2)} ` +
          `de tu límite de $${limite.toFixed(2)} este mes`;

        await this.enviarMensajeWhatsapp(usuario.telefono, mensaje);
      }
    }
  }
}
