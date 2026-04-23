import {
  IsString,
  IsNumber,
  IsPositive,
  IsDateString,
  IsOptional,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CuotaMesDto {
  @IsString()
  mes: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  total: number;
}

export class ImportarResumenDto {
  @IsString()
  nombre: string;

  @IsString()
  banco: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  saldoActual: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsOptional()
  saldoDolares?: number | null;

  @IsDateString()
  vencimiento: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  pagoMinimo: number;

  @IsDateString()
  @IsOptional()
  cierreActual?: string | null;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CuotaMesDto)
  cuotasAVencer: CuotaMesDto[];
}
