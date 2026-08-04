import { Module } from '@nestjs/common';
import { CoHostService } from './co-host.service';
import { CoHostController } from './co-host.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [CoHostController],
  providers: [CoHostService],
  exports: [CoHostService],
})
export class CoHostModule {}
