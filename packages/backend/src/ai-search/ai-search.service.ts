import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { OpenAIService } from '../openai/openai.service';
import { ElasticsearchService } from '../elasticsearch/elasticsearch.service';

@Injectable()
export class AISearchService {
  constructor(
    private prisma: PrismaService,
    private openaiService: OpenAIService,
    private elasticsearchService: ElasticsearchService,
  ) {}

  async naturalLanguageSearch(query: string, userId?: string) {
    try {
      // 1. Extract filters using AI
      const filters = await this.openaiService.extractSearchFilters(query);

      // 2. Perform vector search in Elasticsearch
      const vectorResults = await this.elasticsearchService.vectorSearch(query);

      // 3. Apply traditional filters
      const filtered = await this.applyFilters(vectorResults, filters);

      // 4. Log search query for analytics
      await this.logSearch(query, filters, filtered, userId);

      return {
        results: filtered,
        extractedFilters: filters,
        totalResults: filtered.length,
      };
    } catch (error) {
      throw new BadRequestException('Search failed: ' + error.message);
    }
  }

  private async applyFilters(properties: any[], filters: any) {
    let filtered = [...properties];

    if (filters.location) {
      filtered = filtered.filter((p) =>
        p.city?.toLowerCase().includes(filters.location.toLowerCase()) ||
        p.address?.toLowerCase().includes(filters.location.toLowerCase()) ||
        p.country?.toLowerCase().includes(filters.location.toLowerCase()),
      );
    }

    if (filters.minPrice) {
      filtered = filtered.filter((p) => p.basePrice >= filters.minPrice);
    }

    if (filters.maxPrice) {
      filtered = filtered.filter((p) => p.basePrice <= filters.maxPrice);
    }

    if (filters.maxGuests) {
      filtered = filtered.filter((p) => p.maxGuests >= filters.maxGuests);
    }

    if (filters.bedrooms) {
      filtered = filtered.filter((p) => p.bedrooms >= filters.bedrooms);
    }

    if (filters.amenities && filters.amenities.length > 0) {
      filtered = filtered.filter((p) =>
        filters.amenities.every((amenity: string) =>
          p.amenities?.includes(amenity),
        ),
      );
    }

    if (filters.checkIn && filters.checkOut) {
      filtered = await this.filterByAvailability(filtered, filters.checkIn, filters.checkOut);
    }

    return filtered;
  }

  private async filterByAvailability(properties: any[], checkIn: string, checkOut: string) {
    const availableProperties = [];

    for (const property of properties) {
      const availability = await this.prisma.availability.findMany({
        where: {
          propertyId: property.id,
          date: {
            gte: new Date(checkIn),
            lte: new Date(checkOut),
          },
        },
      });

      const allAvailable = availability.every((a) => a.available);
      if (allAvailable) {
        availableProperties.push(property);
      }
    }

    return availableProperties;
  }

  private async logSearch(query: string, filters: any, results: any[], userId?: string) {
    await this.prisma.searchQuery.create({
      data: {
        userId,
        query,
        filters,
        results,
      },
    });
  }

  async indexProperty(propertyId: string) {
    const property = await this.prisma.property.findUnique({
      where: { id: propertyId },
    });

    if (!property) {
      throw new BadRequestException('Property not found');
    }

    // Generate embedding using OpenAI
    const embedding = await this.openaiService.generateEmbedding(
      `${property.name} ${property.description} ${property.amenities.join(' ')}`,
    );

    // Store in database
    await this.prisma.propertyVector.upsert({
      where: { propertyId },
      create: { propertyId, embedding },
      update: { embedding },
    });

    // Index in Elasticsearch
    await this.elasticsearchService.indexProperty(property);

    return { success: true };
  }
}
