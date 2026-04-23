import { Injectable, NotFoundException, ForbiddenException, Logger, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfParseLib = require('pdf-parse') as (buffer: Buffer) => Promise<{ text: string }>;
import { TarjetaResumen } from './tarjeta-resumen.entity';
import { ImportarResumenDto } from './dto/importar-resumen.dto';

function parsearMonto(str: string): number {
  return parseFloat(str.replace(/\./g, '').replace(',', '.')) || 0;
}

function parsearFecha(str: string): Date {
  const mesesAbrev: Record<string, string> = {
    'Ene': '01', 'Feb': '02', 'Mar': '03', 'Abr': '04',
    'May': '05', 'Jun': '06', 'Jul': '07', 'Ago': '08',
    'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dic': '12',
  };

  const matchAbrev = str.match(/(\d{2})-([A-Za-z]{3})-(\d{2})/);
  if (matchAbrev) {
    const mes = mesesAbrev[matchAbrev[2]] || '01';
    return new Date(`20${matchAbrev[3]}-${mes}-${matchAbrev[1]}`);
  }

  const matchSlash = str.match(/(\d{1,2})\/(\d{2})\/(\d{2,4})/);
  if (matchSlash) {
    const anio = matchSlash[3].length === 2 ? '20' + matchSlash[3] : matchSlash[3];
    return new Date(`${anio}-${matchSlash[2].padStart(2, '0')}-${matchSlash[1].padStart(2, '0')}`);
  }

  return new Date();
}

@Injectable()
export class TarjetasService {
  private readonly logger = new Logger(TarjetasService.name);

  constructor(
    @InjectRepository(TarjetaResumen)
    private readonly tarjetasRepo: Repository<TarjetaResumen>,
  ) {}

  async importar(dto: ImportarResumenDto, usuarioId: number): Promise<TarjetaResumen> {
    const tarjeta = this.tarjetasRepo.create({
      ...dto,
      saldoDolares: dto.saldoDolares ?? null,
      cierreActual: dto.cierreActual ?? null,
      usuarioId,
    });
    return this.tarjetasRepo.save(tarjeta);
  }

  async findAll(usuarioId: number): Promise<TarjetaResumen[]> {
    return this.tarjetasRepo.find({
      where: { usuarioId },
      order: { fechaImportacion: 'DESC' },
    });
  }

  async eliminar(id: number, usuarioId: number): Promise<void> {
    const tarjeta = await this.tarjetasRepo.findOneBy({ id });
    if (!tarjeta) throw new NotFoundException('Tarjeta no encontrada');
    if (tarjeta.usuarioId !== usuarioId) throw new ForbiddenException();
    await this.tarjetasRepo.remove(tarjeta);
  }

  async parsearPDF(fileBuffer: Buffer): Promise<unknown> {
    let texto: string;
    try {
      this.logger.log(`Parseando PDF, tamaño buffer: ${fileBuffer.length} bytes`);
      const data = await pdfParseLib(fileBuffer);
      texto = data.text;
      this.logger.log(`PDF extraído, longitud texto: ${texto.length} caracteres`);
      this.logger.log(`Primeros 500 chars: ${texto.substring(0, 500)}`);
    } catch (error) {
      this.logger.error('Error al leer el PDF con pdf-parse:', error);
      throw new InternalServerErrorException('No se pudo leer el archivo PDF');
    }

    try {

    const esBBVA = texto.includes('BBVA') || texto.includes('Visa Internacional');
    const esNaranja = texto.includes('Naranja') || texto.includes('NaranjaX') || texto.includes('Naranja X');

    const nombre = esBBVA ? 'BBVA Visa' : esNaranja ? 'Naranja X' : 'Tarjeta de crédito';
    const banco = esBBVA ? 'BBVA' : esNaranja ? 'Naranja X' : 'Desconocido';

    let saldoActual = 0;
    if (esBBVA) {
      const matchSaldo =
        texto.match(/SALDO ACTUAL\s+\$\s*([\d.,]+)/i) ||
        texto.match(/SALDO ACTUAL\s+([\d.,]+)/i);
      if (matchSaldo) saldoActual = parsearMonto(matchSaldo[1]);
    } else if (esNaranja) {
      const matchSaldo =
        texto.match(/TOTAL\s*\n?\s*\$([\d.,]+)/i) ||
        texto.match(/total a pagar es\s*\$\s*([\d.,]+)/i) ||
        texto.match(/\$([\d.,]+)\s*\+\s*u\$s/i);
      if (matchSaldo) saldoActual = parsearMonto(matchSaldo[1]);
    }

    let saldoDolares: number | null = null;
    const matchDolares =
      texto.match(/u\$s\s*([\d.,]+)/i) ||
      texto.match(/SALDO ACTUAL U\$S\s+([\d.,]+)/i);
    if (matchDolares) saldoDolares = parsearMonto(matchDolares[1]);

    let vencimiento = new Date();
    if (esBBVA) {
      const matchVenc =
        texto.match(/VENCIMIENTO ACTUAL\s+([\d-]+)/i) ||
        texto.match(/vence el\s+(\d{2}[-/]\d{2}[-/]\d{2,4})/i);
      if (matchVenc) vencimiento = parsearFecha(matchVenc[1]);
    } else if (esNaranja) {
      const matchVenc = texto.match(/vence el\s+(\d{1,2}\/\d{2}\/\d{2,4})/i);
      if (matchVenc) vencimiento = parsearFecha(matchVenc[1]);
    }

    let pagoMinimo = 0;
    if (esBBVA) {
      const matchMin = texto.match(/PAGO M[IÍ]NIMO\s*\$?\s*([\d.,]+)/i);
      if (matchMin) pagoMinimo = parsearMonto(matchMin[1]);
    } else if (esNaranja) {
      const matchMin =
        texto.match(/LA MENOR ENTREGA\s*\$\s*([\d.,]+)/i) ||
        texto.match(/PAGO M[IÍ]NIMO.*?\$\s*([\d.,]+)/i);
      if (matchMin) pagoMinimo = parsearMonto(matchMin[1]);
    }

    const cuotasAVencer: { mes: string; total: number }[] = [];
    const mesesES: Record<string, string> = {
      'ENERO': '01', 'FEBRERO': '02', 'MARZO': '03', 'ABRIL': '04',
      'MAYO': '05', 'JUNIO': '06', 'JULIO': '07', 'AGOSTO': '08',
      'SETIEMBRE': '09', 'SEPTIEMBRE': '09', 'OCTUBRE': '10',
      'NOVIEMBRE': '11', 'DICIEMBRE': '12',
    };

    const regexCuotas = /([A-ZÁÉÍÓÚ]+)\/(\d{2})\s*\$?\s*([\d.,]+)/gi;
    for (const linea of texto.split('\n')) {
      if (linea.toLowerCase().includes('partir')) continue;
      let match: RegExpExecArray | null;
      regexCuotas.lastIndex = 0;
      while ((match = regexCuotas.exec(linea)) !== null) {
        const mes = match[1].toUpperCase();
        const anio = '20' + match[2];
        const total = parsearMonto(match[3]);
        const numMes = mesesES[mes];
        if (numMes && total > 0) {
          const mesStr = `${anio}-${numMes}`;
          if (!cuotasAVencer.find((c) => c.mes === mesStr)) {
            cuotasAVencer.push({ mes: mesStr, total });
          }
        }
      }
    }

    cuotasAVencer.sort((a, b) => a.mes.localeCompare(b.mes));
    this.logger.log(`Cuotas encontradas: ${JSON.stringify(cuotasAVencer)}`);

    return {
      nombre,
      banco,
      saldoActual,
      saldoDolares,
      vencimiento,
      pagoMinimo,
      cierreActual: null,
      cuotasAVencer,
    };
    } catch (error) {
      this.logger.error('Error parseando contenido del PDF:', error);
      throw new InternalServerErrorException('Error al procesar el contenido del PDF');
    }
  }
}
