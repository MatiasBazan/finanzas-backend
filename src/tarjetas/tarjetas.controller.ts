import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
  HttpCode,
  HttpStatus,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  Logger,
  ParseFilePipe,
  FileTypeValidator,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { TarjetasService } from './tarjetas.service';
import { ImportarResumenDto } from './dto/importar-resumen.dto';
import { GetUser, type UsuarioAutenticado } from '../auth/decorators/get-user.decorator';
import type { Express } from 'express';

@UseGuards(AuthGuard('jwt'))
@Controller('tarjetas')
export class TarjetasController {
  private readonly logger = new Logger(TarjetasController.name);

  constructor(private readonly tarjetasService: TarjetasService) {}

  @Post('parsear-pdf')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  parsearPDF(
    @UploadedFile(
      new ParseFilePipe({
        validators: [new FileTypeValidator({ fileType: 'application/pdf' })],
      }),
    )
    file: Express.Multer.File,
  ) {
    this.logger.log(`Archivo recibido: ${file?.originalname}, tamaño: ${file?.size} bytes`);
    return this.tarjetasService.parsearPDF(file.buffer);
  }

  @Post('importar-resumen')
  importar(
    @Body() dto: ImportarResumenDto,
    @GetUser() usuario: UsuarioAutenticado,
  ) {
    return this.tarjetasService.importar(dto, usuario.id);
  }

  @Get()
  findAll(@GetUser() usuario: UsuarioAutenticado) {
    return this.tarjetasService.findAll(usuario.id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  eliminar(
    @Param('id', ParseIntPipe) id: number,
    @GetUser() usuario: UsuarioAutenticado,
  ) {
    return this.tarjetasService.eliminar(id, usuario.id);
  }
}
