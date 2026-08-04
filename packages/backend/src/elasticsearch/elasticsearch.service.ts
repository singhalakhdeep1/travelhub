import { Injectable } from '@nestjs/common';
import { Client } from '@elastic/elasticsearch';

@Injectable()
export class ElasticsearchService {
  private client: Client;

  constructor() {
    this.client = new Client({
      node: process.env.ELASTICSEARCH_URL || 'http://localhost:9200',
    });
  }

  async indexProperty(property: any) {
    try {
      await this.client.index({
        index: 'properties',
        id: property.id,
        document: {
          name: property.name,
          description: property.description,
          city: property.city,
          country: property.country,
          amenities: property.amenities,
          basePrice: property.basePrice,
          maxGuests: property.maxGuests,
          bedrooms: property.bedrooms,
          rating: property.rating,
        },
      });
      return { success: true };
    } catch (error) {
      console.error('Elasticsearch indexing failed:', error);
      return { success: false, error };
    }
  }

  async vectorSearch(query: string) {
    try {
      // For now, use simple text search. In production, use vector search with embeddings
      const response = await this.client.search({
        index: 'properties',
        body: {
          query: {
            multi_match: {
              query,
              fields: ['name^2', 'description', 'city', 'amenities'],
              fuzziness: 'AUTO',
            },
          },
        },
      });

      return response.hits.hits.map((hit: any) => ({
        id: hit._id,
        ...hit._source,
        relevanceScore: hit._score,
      }));
    } catch (error) {
      console.error('Elasticsearch search failed:', error);
      // Fallback to empty array if Elasticsearch is not available
      return [];
    }
  }

  async search(filters: any) {
    try {
      const must: any[] = [];

      if (filters.city) {
        must.push({ match: { city: filters.city } });
      }

      if (filters.minPrice) {
        must.push({ range: { basePrice: { gte: filters.minPrice } } });
      }

      if (filters.maxPrice) {
        must.push({ range: { basePrice: { lte: filters.maxPrice } } });
      }

      if (filters.amenities && filters.amenities.length > 0) {
        must.push({ terms: { amenities: filters.amenities } });
      }

      const response = await this.client.search({
        index: 'properties',
        body: {
          query: {
            bool: {
              must: must.length > 0 ? must : [{ match_all: {} }],
            },
          },
        },
      });

      return response.hits.hits.map((hit: any) => ({
        id: hit._id,
        ...hit._source,
      }));
    } catch (error) {
      console.error('Elasticsearch search failed:', error);
      return [];
    }
  }
}
