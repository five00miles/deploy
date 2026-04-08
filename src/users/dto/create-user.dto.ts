import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    example: 'alice@example.com',
    description: 'Unique user email',
  })
  @IsEmail()
  email!: string;

  @ApiPropertyOptional({
    example: 'Alice',
    description: 'Optional display name',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;
}
