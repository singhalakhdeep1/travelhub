import { Controller, Get, Param, Query, UseGuards, Request } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('analytics')
@UseGuards(JwtAuthGuard)
export class AnalyticsController {
  constructor(private analyticsService: AnalyticsService) {}

  @Get('bookings')
  getBookingAnalytics(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.analyticsService.getBookingAnalytics(
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }

  @Get('property/:id')
  getPropertyAnalytics(@Param('id') id: string) {
    return this.analyticsService.getPropertyAnalytics(id);
  }

  @Get('user')
  getUserAnalytics(@Request() req) {
    return this.analyticsService.getUserAnalytics(req.user.id);
  }
}
