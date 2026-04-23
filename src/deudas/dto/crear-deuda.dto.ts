import {
  IsString,
  IsNumber,
  IsPositive,
  IsInt,
  Min,
  IsDateString,
  IsOptional,
  IsEnum,
} from 'class-validator';
import { EstadoDeuda } from '../estado-deuda.enum';

export class CrearDeudaDto {
  @IsString()
  descripcion: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  montoTotal: number;

  @IsInt()
  @Min(1)
  cantidadCuotas: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  cuotasPagadas?: number;

  @IsDateString()
  @IsOptional()
  fechaVencimiento?: string;

  @IsEnum(EstadoDeuda)
  @IsOptional()
  estado?: EstadoDeuda;
}
