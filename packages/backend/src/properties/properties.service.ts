import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CacheService } from '../cache/cache.service';

@Injectable()
export class PropertiesService {
  constructor(
    private prisma: PrismaService,
    private cache: CacheService,
  ) {}

  async create(data: any) {
    return this.prisma.property.create({
      data,
      include: {
        host: true,
        rooms: true,
      },
    });
  }

  async findAll(filters: any = {}) {
    const cacheKey = `properties:${JSON.stringify(filters)}`;
    const cached = await this.cache.get(cacheKey);
    if (cached) return JSON.parse(cached);

    const properties = await this.prisma.property.findMany({
      where: {
        isActive: true,
        ...(filters.city && { city: filters.city }),
        ...(filters.type && { type: filters.type }),
        ...(filters.minPrice && { basePrice: { gte: filters.minPrice } }),
        ...(filters.maxPrice && { basePrice: { lte: filters.maxPrice } }),
        ...(filters.minGuests && { maxGuests: { gte: filters.minGuests } }),
      },
      include: {
        host: true,
        rooms: true,
        _count: {
          select: { reviews: true },
        },
      },
    });

    await this.cache.set(cacheKey, JSON.stringify(properties), 300);
    return properties;
  }

  async findById(id: string) {
    const cacheKey = `property:${id}`;
    const cached = await this.cache.get(cacheKey);
    if (cached) return JSON.parse(cached);

    const property = await this.prisma.property.findUnique({
      where: { id },
      include: {
        host: true,
        rooms: true,
        reviews: {
          include: { user: true },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        availability: {
          where: {
            date: { gte: new Date() },
          },
          orderBy: { date: 'asc' },
          take: 30,
        },
      },
    });

    if (!property) {
      throw new NotFoundException('Property not found');
    }

    await this.cache.set(cacheKey, JSON.stringify(property), 600);
    return property;
  }

  async update(id: string, data: any) {
    await this.cache.delete(`property:${id}`);
    return this.prisma.property.update({
      where: { id },
      data,
      include: {
        host: true,
        rooms: true,
      },
    });
  }

  async remove(id: string) {
    await this.cache.delete(`property:${id}`);
    return this.prisma.property.delete({
      where: { id },
    });
  }

  async checkAvailability(propertyId: string, checkIn: Date, checkOut: Date) {
    const bookings = await this.prisma.booking.findMany({
      where: {
        propertyId,
        status: { in: ['CONFIRMED', 'PENDING'] },
        OR: [
          {
            AND: [
              { checkIn: { lte: checkIn } },
              { checkOut: { gt: checkIn } },
            ],
          },
          {
            AND: [
              { checkIn: { lt: checkOut } },
              { checkOut: { gte: checkOut } },
            ],
          },
          {
            AND: [
              { checkIn: { gte: checkIn } },
              { checkOut: { lte: checkOut } },
            ],
          },
        ],
      },
    });

    return bookings.length === 0;
  }
}
