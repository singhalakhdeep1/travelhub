import { Module } from '@nestjs/common';
import { AISearchService } from './ai-search.service';
import { AISearchController } from './ai-search.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { OpenAIModule } from '../openai/openai.module';
import { ElasticsearchModule } from '../elasticsearch/elasticsearch.module';

@Module({
  imports: [PrismaModule, OpenAIModule, ElasticsearchModule],
  controllers: [AISearchController],
  providers: [AISearchService],
  exports: [AISearchService],
})
export class AISearchModule {}
