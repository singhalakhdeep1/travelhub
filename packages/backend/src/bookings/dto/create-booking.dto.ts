import { IsString, IsDate, IsNumber, IsOptional, Min } from 'class-validator';

export class CreateBookingDto {
  @IsString()
  propertyId: string;

  @IsString()
  userId: string;

  @IsDate()
  checkIn: Date;

  @IsDate()
  checkOut: Date;

  @IsNumber()
  @Min(1)
  guests: number;

  @IsNumber()
  @Min(1)
  @IsOptional()
  totalPrice?: number;

  @IsString()
  @IsOptional()
  status?: string;
}
