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
import { DeudasService } from './deudas.service';
import { CrearDeudaDto } from './dto/crear-deuda.dto';
import { ActualizarDeudaDto } from './dto/actualizar-deuda.dto';
import { GetUser, type UsuarioAutenticado } from '../auth/decorators/get-user.decorator';

@UseGuards(AuthGuard('jwt'))
@Controller('deudas')
export class DeudasController {
  constructor(private readonly deudasService: DeudasService) {}

  @Post()
  crear(@Body() dto: CrearDeudaDto, @GetUser() usuario: UsuarioAutenticado) {
    return this.deudasService.crear(dto, usuario.id);
  }

  @Get('proyeccion')
  proyeccion(@GetUser() usuario: UsuarioAutenticado) {
    return this.deudasService.proyeccion(usuario.id);
  }

  @Get()
  findAll(@GetUser() usuario: UsuarioAutenticado) {
    return this.deudasService.findAll(usuario.id);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number, @GetUser() usuario: UsuarioAutenticado) {
    return this.deudasService.findOne(id, usuario.id);
  }

  @Patch(':id')
  actualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ActualizarDeudaDto,
    @GetUser() usuario: UsuarioAutenticado,
  ) {
    return this.deudasService.actualizar(id, dto, usuario.id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  eliminar(@Param('id', ParseIntPipe) id: number, @GetUser() usuario: UsuarioAutenticado) {
    return this.deudasService.eliminar(id, usuario.id);
  }
}
