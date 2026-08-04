import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CoHostService {
  constructor(private prisma: PrismaService) {}

  async createProfile(userId: string, data: any) {
    return this.prisma.coHost.create({
      data: {
        userId,
        skills: data.skills || [],
        services: data.services || [],
        rates: data.rates || {},
        availability: data.availability || [],
        bio: data.bio,
      },
    });
  }

  async getProfile(userId: string) {
    return this.prisma.coHost.findUnique({
      where: { userId },
      include: {
        relations: true,
        reviews: true,
      },
    });
  }

  async search(filters: any) {
    const coHosts = await this.prisma.coHost.findMany({
      where: {
        isActive: true,
        ...(filters.location && {
          relations: {
            some: {
              property: {
                city: { contains: filters.location, mode: 'insensitive' },
              },
            },
          },
        }),
        ...(filters.services && {
          services: { hasSome: filters.services },
        }),
        ...(filters.skills && {
          skills: { hasSome: filters.skills },
        }),
      },
      include: {
        user: true,
        relations: {
          include: {
            property: true,
          },
        },
        reviews: true,
      },
    });

    const scored = coHosts.map((cohost) => ({
      ...cohost,
      matchScore: this.calculateMatchScore(cohost, filters),
    }));

    return scored.sort((a, b) => b.matchScore - a.matchScore);
  }

  private calculateMatchScore(cohost: any, filters: any): number {
    let score = 0;

    if (filters.skills) {
      const skillMatch =
        filters.skills.filter((s: string) => cohost.skills.includes(s)).length /
        filters.skills.length;
      score += skillMatch * 0.4;
    }

    if (filters.services) {
      const serviceMatch =
        filters.services.filter((s: string) => cohost.services.includes(s)).length /
        filters.services.length;
      score += serviceMatch * 0.3;
    }

    score += (cohost.rating / 5) * 0.2;

    score += Math.min(cohost.propertiesManaged / 20, 1) * 0.1;

    return score;
  }

  async hire(hostId: string, coHostId: string, propertyId: string, terms: any) {
    return this.prisma.hostCoHostRelation.create({
      data: {
        hostId,
        coHostId,
        propertyId,
        terms,
        status: 'PENDING',
        startDate: new Date(),
      },
    });
  }

  async acceptRelation(relationId: string) {
    return this.prisma.hostCoHostRelation.update({
      where: { id: relationId },
      data: { status: 'ACTIVE' },
    });
  }

  async terminateRelation(relationId: string) {
    return this.prisma.hostCoHostRelation.update({
      where: { id: relationId },
      data: { status: 'TERMINATED', endDate: new Date() },
    });
  }

  async reviewCoHost(hostId: string, coHostId: string, rating: number, comment?: string) {
    return this.prisma.coHostReview.create({
      data: {
        coHostId,
        hostId,
        rating,
        comment,
      },
    });
  }

  async updateCoHostRating(coHostId: string) {
    const reviews = await this.prisma.coHostReview.findMany({
      where: { coHostId },
    });

    const avgRating =
      reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0;

    await this.prisma.coHost.update({
      where: { id: coHostId },
      data: { rating: avgRating },
    });

    return avgRating;
  }
}
