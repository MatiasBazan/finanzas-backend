import {
  IsEnum,
  IsNumber,
  IsPositive,
  IsString,
  IsOptional,
  IsDateString,
  IsBoolean,
} from 'class-validator';
import { Categoria } from '../categoria.enum';

export class CrearGastoDto {
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  monto: number;

  @IsEnum(Categoria)
  categoria: Categoria;

  @IsString()
  @IsOptional()
  descripcion?: string;

  @IsDateString()
  fecha: string;

  @IsBoolean()
  @IsOptional()
  pagado?: boolean;
}
