import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { OpenAIService } from '../openai/openai.service';

@Injectable()
export class PricingService {
  constructor(
    private prisma: PrismaService,
    private openaiService: OpenAIService,
  ) {}

  async getPricingTips(propertyId: string) {
    const property = await this.prisma.property.findUnique({
      where: { id: propertyId },
    });

    if (!property) {
      throw new BadRequestException('Property not found');
    }

    // Fetch similar properties in the same city
    const similarProperties = await this.prisma.property.findMany({
      where: {
        city: property.city,
        type: property.type,
        isActive: true,
        id: { not: propertyId },
      },
      take: 10,
    });

    // Calculate factors
    const factors = await this.calculateFactors(property);

    // ML model prediction (simplified)
    const suggestedPrice = await this.predictPrice(
      property,
      similarProperties,
      factors,
    );

    // Cache the pricing tip
    await this.prisma.pricingTip.create({
      data: {
        propertyId,
        suggestedPrice,
        factors,
        confidence: suggestedPrice.confidence,
      },
    });

    return {
      propertyId,
      currentPrice: property.basePrice,
      suggestedPrice,
      factors,
      similarProperties: similarProperties.map((p) => ({
        id: p.id,
        name: p.name,
        basePrice: p.basePrice,
        rating: p.rating,
      })),
    };
  }

  private async calculateFactors(property: any) {
    const seasonality = await this.getSeasonalityFactor(property.city);
    const demand = await this.getDemandFactor(property);
    const competitorPrices = await this.getCompetitorPrices(property);
    const ratingFactor = (property.rating - 4) * 0.05;

    return {
      seasonality,
      demand,
      competitorPrices,
      propertyRating: ratingFactor,
    };
  }

  private async getSeasonalityFactor(city: string): Promise<number> {
    const month = new Date().getMonth();
    const seasonalCities = {
      'New York': month >= 5 && month <= 8 ? 0.15 : -0.05,
      'Paris': month >= 4 && month <= 7 ? 0.2 : -0.1,
      'Tokyo': month >= 2 && month <= 5 ? 0.1 : 0,
    };
    return seasonalCities[city] || 0;
  }

  private async getDemandFactor(property: any): Promise<number> {
    const bookings = await this.prisma.booking.findMany({
      where: {
        propertyId: property.id,
        status: 'CONFIRMED',
        createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
      },
    });

    const avgBookings = 5; // baseline
    const demandFactor = (bookings.length - avgBookings) / avgBookings * 0.1;
    return Math.max(-0.1, Math.min(0.2, demandFactor));
  }

  private async getCompetitorPrices(property: any): Promise<number> {
    const competitors = await this.prisma.property.findMany({
      where: {
        city: property.city,
        type: property.type,
        isActive: true,
      },
      take: 20,
    });

    const avgPrice = competitors.reduce((sum, p) => sum + p.basePrice, 0) / competitors.length;
    const priceDiff = (property.basePrice - avgPrice) / avgPrice;
    return -priceDiff * 0.05; // Suggest lowering if above average
  }

  private async predictPrice(property: any, similar: any[], factors: any) {
    const avgSimilarPrice = similar.length > 0
      ? similar.reduce((sum, p) => sum + p.basePrice, 0) / similar.length
      : property.basePrice;

    const adjustments = Object.values(factors).reduce(
      (sum: number, f: any) => sum + (typeof f === 'number' ? f : 0),
      0,
    );

    const suggested = avgSimilarPrice * (1 + adjustments);

    const variance = similar.length > 0
      ? similar.reduce((sum, p) => sum + Math.pow(p.basePrice - avgSimilarPrice, 2), 0) / similar.length
      : 0;

    const confidence = Math.max(0.5, 1 - (Math.sqrt(variance) / avgSimilarPrice));

    return {
      min: Math.round(suggested * 0.95),
      max: Math.round(suggested * 1.05),
      optimal: Math.round(suggested),
      confidence: Math.min(0.95, confidence),
    };
  }

  async getPricingHistory(propertyId: string) {
    return this.prisma.pricingTip.findMany({
      where: { propertyId },
      orderBy: { generatedAt: 'desc' },
      take: 30,
    });
  }
}
