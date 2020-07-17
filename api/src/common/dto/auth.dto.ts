import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsString, IsNotEmpty } from "class-validator";
import { Expose } from "class-transformer";

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

export class LoginUserOutput {
    @ApiProperty()
    @Expose()
    @IsString()
    @IsNotEmpty()
    token: string;
  
    /** TODO: include refresh token */
}