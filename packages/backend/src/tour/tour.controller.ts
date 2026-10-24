import { Controller, Post, Get, Delete, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { TourService } from './tour.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('properties')
export class TourController {
  constructor(private readonly tourService: TourService) {}

  @Post(':id/tours')
  @UseGuards(JwtAuthGuard)
  async uploadTour(
    @Param('id') id: string,
    @Body() body: { files: any[]; metadata: any },
  ) {
    return this.tourService.uploadTour(id, body.files, body.metadata);
  }

  @Get(':id/tours')
  @UseGuards(JwtAuthGuard)
  async getTour(@Param('id') id: string) {
    return this.tourService.getTour(id);
  }

  @Delete(':id/tours')
  @UseGuards(JwtAuthGuard)
  async deleteTour(@Param('id') id: string) {
    return this.tourService.deleteTour(id);
  }

  @Post('tours/:id/scenes')
  @UseGuards(JwtAuthGuard)
  async addScene(@Param('id') id: string, @Body() sceneData: any) {
    return this.tourService.addScene(id, sceneData);
  }

  @Patch('tours/:id/scenes/:sceneName')
  @UseGuards(JwtAuthGuard)
  async updateScene(
    @Param('id') id: string,
    @Param('sceneName') sceneName: string,
    @Body() updates: any,
  ) {
    return this.tourService.updateScene(id, sceneName, updates);
  }

  @Delete('tours/:id/scenes/:sceneName')
  @UseGuards(JwtAuthGuard)
  async deleteScene(@Param('id') id: string, @Param('sceneName') sceneName: string) {
    return this.tourService.deleteScene(id, sceneName);
  }
}
