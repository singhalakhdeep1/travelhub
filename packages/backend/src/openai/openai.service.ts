import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

@Injectable()
export class OpenAIService {
  private openai: OpenAI;

  constructor(private configService: ConfigService) {
    this.openai = new OpenAI({
      apiKey: this.configService.get('OPENAI_API_KEY'),
    });
  }

  async extractSearchFilters(query: string) {
    const prompt = `
      Extract search filters from this travel property search query: "${query}"
      
      Return a JSON object with these fields (only include if mentioned):
      - location: string (city, country, or landmark)
      - minPrice: number (minimum price per night)
      - maxPrice: number (maximum price per night)
      - maxGuests: number (maximum number of guests)
      - bedrooms: number (minimum number of bedrooms)
      - amenities: array of strings (e.g., ["gym", "pool", "wifi"])
      - checkIn: date string (YYYY-MM-DD)
      - checkOut: date string (YYYY-MM-DD)
      
      If a field is not mentioned, omit it from the JSON.
      Return only valid JSON, no additional text.
    `;

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
      });

      const content = response.choices[0].message.content;
      return JSON.parse(content);
    } catch (error) {
      console.error('OpenAI filter extraction failed:', error);
      return {};
    }
  }

  async generateEmbedding(text: string): Promise<number[]> {
    try {
      const response = await this.openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: text,
      });

      return response.data[0].embedding;
    } catch (error) {
      console.error('OpenAI embedding generation failed:', error);
      return [];
    }
  }

  async generateReviewSummary(reviews: any[]) {
    const reviewsText = reviews
      .map((r) => `${r.rating}/5 - ${r.comment || 'No comment'}`)
      .join('\n');

    const prompt = `
      Summarize these property reviews into a structured JSON response:
      
      Reviews:
      ${reviewsText}
      
      Return JSON with this structure:
      {
        "overall": "One sentence summary (e.g., '4.5/5 - Excellent property with minor issues')",
        "pros": ["Top 3 pros as bullet points"],
        "cons": ["Top 3 cons as bullet points"],
        "categories": {
          "cleanliness": number (out of 5),
          "location": number (out of 5),
          "communication": number (out of 5),
          "value": number (out of 5)
        }
      }
      
      Return only valid JSON, no additional text.
    `;

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.5,
      });

      const content = response.choices[0].message.content;
      return JSON.parse(content);
    } catch (error) {
      console.error('OpenAI review summary failed:', error);
      return null;
    }
  }

  async generatePricingInsights(property: any, similarProperties: any[], factors: any) {
    const prompt = `
      Generate pricing insights for a property.
      
      Property: ${property.name} in ${property.city}
      Current Price: $${property.basePrice}/night
      Rating: ${property.rating}/5
      
      Similar Properties Average Price: $${similarProperties.reduce((sum, p) => sum + p.basePrice, 0) / similarProperties.length}/night
      
      Market Factors:
      - Seasonality: ${factors.seasonality}
      - Demand: ${factors.demand}
      - Competitor Prices: ${factors.competitorPrices}
      - Property Rating: ${factors.propertyRating}
      
      Return JSON with:
      {
        "suggestedMin": number,
        "suggestedMax": number,
        "suggestedOptimal": number,
        "confidence": number (0-1),
        "reasoning": "Brief explanation"
      }
      
      Return only valid JSON, no additional text.
    `;

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
      });

      const content = response.choices[0].message.content;
      return JSON.parse(content);
    } catch (error) {
      console.error('OpenAI pricing insights failed:', error);
      return null;
    }
  }
}
