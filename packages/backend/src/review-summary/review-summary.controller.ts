import { Controller, Get, Post, Param, UseGuards } from '@nestjs/common';
import { ReviewSummaryService } from './review-summary.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('properties')
export class ReviewSummaryController {
  constructor(private readonly reviewSummaryService: ReviewSummaryService) {}

  @Get(':id/review-summary')
  @UseGuards(JwtAuthGuard)
  async getReviewSummary(@Param('id') id: string) {
    return this.reviewSummaryService.getSummary(id);
  }

  @Post(':id/review-summary/invalidate')
  @UseGuards(JwtAuthGuard)
  async invalidateCache(@Param('id') id: string) {
    return this.reviewSummaryService.invalidateCache(id);
  }
}
