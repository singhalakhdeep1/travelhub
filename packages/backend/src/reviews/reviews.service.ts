import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService) {}

  async create(data: any) {
    const { userId, propertyId, rating, comment } = data;

    // Check if user has a completed booking
    const booking = await this.prisma.booking.findFirst({
      where: {
        userId,
        propertyId,
        status: 'COMPLETED',
      },
    });

    if (!booking) {
      throw new BadRequestException('You must have a completed booking to review this property');
    }

    // Check if user already reviewed
    const existingReview = await this.prisma.review.findFirst({
      where: {
        userId,
        propertyId,
      },
    });

    if (existingReview) {
      throw new BadRequestException('You have already reviewed this property');
    }

    const review = await this.prisma.review.create({
      data,
      include: {
        user: true,
        property: true,
      },
    });

    // Update property rating
    await this.updatePropertyRating(propertyId);

    return review;
  }

  async findAll(propertyId?: string) {
    const where = propertyId ? { propertyId } : {};
    return this.prisma.review.findMany({
      where,
      include: {
        user: true,
        property: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string) {
    const review = await this.prisma.review.findUnique({
      where: { id },
      include: {
        user: true,
        property: true,
      },
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    return review;
  }

  async update(id: string, data: any) {
    const review = await this.prisma.review.update({
      where: { id },
      data,
      include: {
        user: true,
        property: true,
      },
    });

    await this.updatePropertyRating(review.propertyId);

    return review;
  }

  async remove(id: string) {
    const review = await this.findById(id);
    await this.prisma.review.delete({
      where: { id },
    });
    await this.updatePropertyRating(review.propertyId);
    return { message: 'Review deleted successfully' };
  }

  private async updatePropertyRating(propertyId: string) {
    const reviews = await this.prisma.review.findMany({
      where: { propertyId },
    });

    const avgRating = reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

    await this.prisma.property.update({
      where: { id: propertyId },
      data: {
        rating: avgRating,
        reviewCount: reviews.length,
      },
    });
  }
}
