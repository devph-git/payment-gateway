import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, IsNotEmpty, IsUUID } from 'class-validator';
import { Expose } from 'class-transformer';

/** NOTE: reuse on sensitive actions that require password confirmation */
export class ValidateActionInput {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  password: string;
}

export class LoginUserInput extends ValidateActionInput {
  @ApiProperty()
  @IsEmail()
  @IsString()
  @IsNotEmpty()
  email: string;
}

export class RefreshAuthInput {
  @ApiProperty()
  @IsUUID()
  @IsString()
  @IsNotEmpty()
  uuid: string;

  @ApiProperty()
  @Expose()
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}

export class LoginUserOutput {
  @ApiProperty()
  @Expose()
  @IsString()
  @IsNotEmpty()
  token: string;

  @ApiProperty()
  @Expose()
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}
