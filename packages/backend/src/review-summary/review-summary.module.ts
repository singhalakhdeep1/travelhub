import { Module } from '@nestjs/common';
import { ReviewSummaryService } from './review-summary.service';
import { ReviewSummaryController } from './review-summary.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { OpenAIModule } from '../openai/openai.module';

@Module({
  imports: [PrismaModule, OpenAIModule],
  controllers: [ReviewSummaryController],
  providers: [ReviewSummaryService],
  exports: [ReviewSummaryService],
})
export class ReviewSummaryModule {}
