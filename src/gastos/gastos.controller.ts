import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GastosService } from './gastos.service';
import { CrearGastoDto } from './dto/crear-gasto.dto';
import { ActualizarGastoDto } from './dto/actualizar-gasto.dto';
import { GetUser, type UsuarioAutenticado } from '../auth/decorators/get-user.decorator';

@UseGuards(AuthGuard('jwt'))
@Controller('gastos')
export class GastosController {
  constructor(private readonly gastosService: GastosService) {}

  @Post()
  crear(@Body() dto: CrearGastoDto, @GetUser() usuario: UsuarioAutenticado) {
    return this.gastosService.crear(dto, usuario.id);
  }

  @Get()
  findAll(@GetUser() usuario: UsuarioAutenticado) {
    return this.gastosService.findAll(usuario.id);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number, @GetUser() usuario: UsuarioAutenticado) {
    return this.gastosService.findOne(id, usuario.id);
  }

  @Patch(':id')
  actualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ActualizarGastoDto,
    @GetUser() usuario: UsuarioAutenticado,
  ) {
    return this.gastosService.actualizar(id, dto, usuario.id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  eliminar(@Param('id', ParseIntPipe) id: number, @GetUser() usuario: UsuarioAutenticado) {
    return this.gastosService.eliminar(id, usuario.id);
  }
}
