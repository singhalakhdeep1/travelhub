import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { OpenAIService } from '../openai/openai.service';

@Injectable()
export class ReviewSummaryService {
  constructor(
    private prisma: PrismaService,
    private openaiService: OpenAIService,
  ) {}

  async getSummary(propertyId: string) {
    // Check cache
    const cached = await this.prisma.reviewSummary.findUnique({
      where: { propertyId },
    });

    if (cached && cached.expiresAt > new Date()) {
      return cached.summary;
    }

    // Fetch reviews
    const reviews = await this.prisma.review.findMany({
      where: { propertyId },
      take: 200,
      orderBy: { createdAt: 'desc' },
    });

    if (reviews.length === 0) {
      return {
        overall: 'No reviews yet',
        pros: [],
        cons: [],
        categories: { cleanliness: 0, location: 0, communication: 0, value: 0 },
        reviewCount: 0,
      };
    }

    // Generate summary
    const summary = await this.openaiService.generateReviewSummary(reviews);

    if (!summary) {
      // Fallback to simple aggregation
      return this.generateSimpleSummary(reviews);
    }

    // Cache for 24 hours
    await this.prisma.reviewSummary.upsert({
      where: { propertyId },
      create: {
        propertyId,
        summary,
        reviewCount: reviews.length,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
      update: {
        summary,
        reviewCount: reviews.length,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });

    return { ...summary, reviewCount: reviews.length };
  }

  private generateSimpleSummary(reviews: any[]) {
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    const avgCleanliness = reviews.reduce((sum, r) => sum + (r.cleanliness || 0), 0) / reviews.length;
    const avgLocation = reviews.reduce((sum, r) => sum + (r.location || 0), 0) / reviews.length;
    const avgService = reviews.reduce((sum, r) => sum + (r.service || 0), 0) / reviews.length;
    const avgValue = reviews.reduce((sum, r) => sum + (r.value || 0), 0) / reviews.length;

    const positiveReviews = reviews.filter((r) => r.rating >= 4);
    const negativeReviews = reviews.filter((r) => r.rating <= 2);

    return {
      overall: `${avgRating.toFixed(1)}/5 - Based on ${reviews.length} reviews`,
      pros: positiveReviews.slice(0, 3).map((r) => r.comment || 'Good experience'),
      cons: negativeReviews.slice(0, 3).map((r) => r.comment || 'Areas for improvement'),
      categories: {
        cleanliness: avgCleanliness || avgRating,
        location: avgLocation || avgRating,
        communication: avgService || avgRating,
        value: avgValue || avgRating,
      },
      reviewCount: reviews.length,
    };
  }

  async invalidateCache(propertyId: string) {
    await this.prisma.reviewSummary.deleteMany({ where: { propertyId } });
  }
}
