import { Controller, Post, Get, Body, Param, UseGuards } from '@nestjs/common';
import { CoHostService } from './co-host.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('co-hosts')
export class CoHostController {
  constructor(private readonly coHostService: CoHostService) {}

  @Post('profile')
  @UseGuards(JwtAuthGuard)
  async createProfile(@Body() body: { userId: string; data: any }) {
    return this.coHostService.createProfile(body.userId, body.data);
  }

  @Get('profile/:userId')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Param('userId') userId: string) {
    return this.coHostService.getProfile(userId);
  }

  @Post('search')
  @UseGuards(JwtAuthGuard)
  async search(@Body() filters: any) {
    return this.coHostService.search(filters);
  }

  @Post('hire')
  @UseGuards(JwtAuthGuard)
  async hire(@Body() body: { hostId: string; coHostId: string; propertyId: string; terms: any }) {
    return this.coHostService.hire(body.hostId, body.coHostId, body.propertyId, body.terms);
  }

  @Post('relations/:id/accept')
  @UseGuards(JwtAuthGuard)
  async acceptRelation(@Param('id') id: string) {
    return this.coHostService.acceptRelation(id);
  }

  @Post('relations/:id/terminate')
  @UseGuards(JwtAuthGuard)
  async terminateRelation(@Param('id') id: string) {
    return this.coHostService.terminateRelation(id);
  }

  @Post('review')
  @UseGuards(JwtAuthGuard)
  async reviewCoHost(@Body() body: { hostId: string; coHostId: string; rating: number; comment?: string }) {
    return this.coHostService.reviewCoHost(body.hostId, body.coHostId, body.rating, body.comment);
  }
}
