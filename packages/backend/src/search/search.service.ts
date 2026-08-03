import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Client as ElasticsearchClient } from '@elastic/elasticsearch';

@Injectable()
export class SearchService {
  private esClient: ElasticsearchClient;

  constructor(private prisma: PrismaService) {
    this.esClient = new ElasticsearchClient({
      node: process.env.ELASTICSEARCH_URL || 'http://localhost:9200',
    });
  }

  async indexProperties() {
    const properties = await this.prisma.property.findMany({
      where: { isActive: true },
      include: {
        host: true,
      },
    });

    for (const property of properties) {
      await this.esClient.index({
        index: 'properties',
        id: property.id,
        body: {
          name: property.name,
          description: property.description,
          city: property.city,
          state: property.state,
          country: property.country,
          type: property.type,
          basePrice: property.basePrice,
          maxGuests: property.maxGuests,
          rating: property.rating,
          location: {
            lat: property.latitude,
            lon: property.longitude,
          },
          amenities: property.amenities,
        },
      });
    }

    return { message: 'Properties indexed successfully' };
  }

  async search(query: string, filters: any = {}) {
    const esQuery: any = {
      bool: {
        must: [
          {
            multi_match: {
              query,
              fields: ['name^3', 'description^2', 'city', 'state'],
            },
          },
        ],
      },
    };

    if (filters.city) {
      esQuery.bool.must.push({ term: { city: filters.city } });
    }

    if (filters.type) {
      esQuery.bool.must.push({ term: { type: filters.type } });
    }

    if (filters.minPrice || filters.maxPrice) {
      esQuery.bool.filter = [
        {
          range: {
            basePrice: {
              ...(filters.minPrice && { gte: filters.minPrice }),
              ...(filters.maxPrice && { lte: filters.maxPrice }),
            },
          },
        },
      ];
    }

    if (filters.minRating) {
      esQuery.bool.filter.push({
        range: { rating: { gte: filters.minRating } },
      });
    }

    const result = await this.esClient.search({
      index: 'properties',
      body: {
        query: esQuery,
        size: filters.limit || 20,
        from: filters.offset || 0,
        sort: filters.sort
          ? [{ [filters.sort]: { order: filters.order || 'asc' } }]
          : [{ _score: { order: 'desc' } }],
      },
    });

    return result.hits.hits.map((hit: any) => ({
      id: hit._id,
      ...hit._source,
      score: hit._score,
    }));
  }

  async getSuggestions(query: string) {
    const result = await this.esClient.search({
      index: 'properties',
      body: {
        query: {
          multi_match: {
            query,
            fields: ['name^5', 'city^3', 'state^2'],
            fuzziness: 'AUTO',
          },
        },
        size: 5,
      },
    });

    return result.hits.hits.map((hit: any) => ({
      id: hit._id,
      name: hit._source.name,
      city: hit._source.city,
      state: hit._source.state,
    }));
  }
}
