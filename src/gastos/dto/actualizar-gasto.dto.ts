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

export class ActualizarGastoDto {
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  @IsOptional()
  monto?: number;

  @IsEnum(Categoria)
  @IsOptional()
  categoria?: Categoria;

  @IsString()
  @IsOptional()
  descripcion?: string;

  @IsDateString()
  @IsOptional()
  fecha?: string;

  @IsBoolean()
  @IsOptional()
  pagado?: boolean;
}
