import { Controller, Post, Body, Get, Query, UseGuards, Param } from '@nestjs/common';
import { AISearchService } from './ai-search.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('search')
export class AISearchController {
  constructor(private readonly aiSearchService: AISearchService) {}

  @Post('natural-language')
  @UseGuards(JwtAuthGuard)
  async naturalLanguageSearch(
    @Body() body: { query: string },
    @Query('userId') userId?: string,
  ) {
    return this.aiSearchService.naturalLanguageSearch(body.query, userId);
  }

  @Post('index/:propertyId')
  @UseGuards(JwtAuthGuard)
  async indexProperty(@Param('propertyId') propertyId: string) {
    return this.aiSearchService.indexProperty(propertyId);
  }
}
