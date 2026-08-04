import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { PricingService } from './pricing.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('properties')
export class PricingController {
  constructor(private readonly pricingService: PricingService) {}

  @Get(':id/pricing-tips')
  @UseGuards(JwtAuthGuard)
  async getPricingTips(@Param('id') id: string) {
    return this.pricingService.getPricingTips(id);
  }

  @Get(':id/pricing-history')
  @UseGuards(JwtAuthGuard)
  async getPricingHistory(@Param('id') id: string) {
    return this.pricingService.getPricingHistory(id);
  }
}
