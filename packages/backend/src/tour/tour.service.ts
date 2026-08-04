import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TourService {
  constructor(private prisma: PrismaService) {}

  async uploadTour(propertyId: string, files: any[], metadata: any) {
    // In production, upload files to S3 and get URLs
    const uploadedFiles = files.map((file, index) => ({
      name: metadata.scenes?.[index]?.name || `Scene ${index + 1}`,
      modelUrl: `s3://tours/${propertyId}/${file.originalname}`,
      thumbnailUrl: `s3://tours/${propertyId}/thumbnail_${index}.jpg`,
      position: metadata.scenes?.[index]?.position || { x: 0, y: 0, z: 0 },
      rotation: metadata.scenes?.[index]?.rotation || { x: 0, y: 0, z: 0 },
      hotspots: metadata.scenes?.[index]?.hotspots || [],
    }));

    const navigation = this.buildNavigationGraph(uploadedFiles);

    const tour = await this.prisma.propertyTour.upsert({
      where: { propertyId },
      create: {
        propertyId,
        scenes: uploadedFiles,
        navigation,
      },
      update: {
        scenes: uploadedFiles,
        navigation,
      },
    });

    return tour;
  }

  private buildNavigationGraph(scenes: any[]) {
    return scenes.map((scene, i) => ({
      from: scene.name,
      to: scenes
        .filter((s, j) => this.calculateDistance(scene.position, s.position) < 10)
        .map(s => s.name),
    }));
  }

  private calculateDistance(pos1: any, pos2: any): number {
    return Math.sqrt(
      Math.pow(pos2.x - pos1.x, 2) +
        Math.pow(pos2.y - pos1.y, 2) +
        Math.pow(pos2.z - pos1.z, 2),
    );
  }

  async getTour(propertyId: string) {
    return this.prisma.propertyTour.findUnique({
      where: { propertyId },
    });
  }

  async deleteTour(propertyId: string) {
    return this.prisma.propertyTour.delete({
      where: { propertyId },
    });
  }

  async addScene(tourId: string, sceneData: any) {
    const tour = await this.prisma.propertyTour.findUnique({
      where: { id: tourId },
    });

    if (!tour) {
      throw new BadRequestException('Tour not found');
    }

    const updatedScenes = [...tour.scenes, sceneData];
    const updatedNavigation = this.buildNavigationGraph(updatedScenes);

    return this.prisma.propertyTour.update({
      where: { id: tourId },
      data: {
        scenes: updatedScenes,
        navigation: updatedNavigation,
      },
    });
  }

  async updateScene(tourId: string, sceneName: string, updates: any) {
    const tour = await this.prisma.propertyTour.findUnique({
      where: { id: tourId },
    });

    if (!tour) {
      throw new BadRequestException('Tour not found');
    }

    const updatedScenes = tour.scenes.map((scene: any) =>
      scene.name === sceneName ? { ...scene, ...updates } : scene,
    );

    const updatedNavigation = this.buildNavigationGraph(updatedScenes);

    return this.prisma.propertyTour.update({
      where: { id: tourId },
      data: {
        scenes: updatedScenes,
        navigation: updatedNavigation,
      },
    });
  }

  async deleteScene(tourId: string, sceneName: string) {
    const tour = await this.prisma.propertyTour.findUnique({
      where: { id: tourId },
    });

    if (!tour) {
      throw new BadRequestException('Tour not found');
    }

    const updatedScenes = tour.scenes.filter((scene: any) => scene.name !== sceneName);
    const updatedNavigation = this.buildNavigationGraph(updatedScenes);

    return this.prisma.propertyTour.update({
      where: { id: tourId },
      data: {
        scenes: updatedScenes,
        navigation: updatedNavigation,
      },
    });
  }
}
