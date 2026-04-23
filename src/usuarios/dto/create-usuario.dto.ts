import { IsEmail, IsString, MinLength } from 'class-validator';

export class CreateUsuarioDto {
  @IsEmail()
  email: string;

  @IsString()
  nombre: string;

  @IsString()
  @MinLength(6)
  password: string;
}
