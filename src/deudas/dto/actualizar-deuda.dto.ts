import { PartialType } from '@nestjs/mapped-types';
import { CrearDeudaDto } from './crear-deuda.dto';

export class ActualizarDeudaDto extends PartialType(CrearDeudaDto) {}
