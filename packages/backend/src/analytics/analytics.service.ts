import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getBookingAnalytics(startDate?: Date, endDate?: Date) {
    const where: any = {};
    if (startDate && endDate) {
      where.createdAt = {
        gte: startDate,
        lte: endDate,
      };
    }

    const bookings = await this.prisma.booking.findMany({
      where,
      include: {
        property: true,
        payments: true,
      },
    });

    const totalRevenue = bookings.reduce((sum, b) => sum + b.totalPrice, 0);
    const confirmedBookings = bookings.filter((b) => b.status === 'CONFIRMED').length;
    const cancelledBookings = bookings.filter((b) => b.status === 'CANCELLED').length;
    const completedBookings = bookings.filter((b) => b.status === 'COMPLETED').length;

    return {
      totalBookings: bookings.length,
      totalRevenue,
      confirmedBookings,
      cancelledBookings,
      completedBookings,
      averageBookingValue: bookings.length > 0 ? totalRevenue / bookings.length : 0,
    };
  }

  async getPropertyAnalytics(propertyId: string) {
    const bookings = await this.prisma.booking.findMany({
      where: { propertyId },
      include: {
        property: true,
        payments: true,
      },
    });

    const totalRevenue = bookings.reduce((sum, b) => sum + b.totalPrice, 0);
    const averageRating = await this.prisma.property.findUnique({
      where: { id: propertyId },
      select: { rating: true },
    });

    return {
      totalBookings: bookings.length,
      totalRevenue,
      averageRating: averageRating?.rating || 0,
      occupancyRate: this.calculateOccupancyRate(bookings),
    };
  }

  async getUserAnalytics(userId: string) {
    const bookings = await this.prisma.booking.findMany({
      where: { userId },
      include: {
        property: true,
      },
    });

    const totalSpent = bookings.reduce((sum, b) => sum + b.totalPrice, 0);
    const cancelledCount = bookings.filter((b) => b.status === 'CANCELLED').length;

    return {
      totalBookings: bookings.length,
      totalSpent,
      cancelledBookings: cancelledCount,
      cancellationRate: bookings.length > 0 ? cancelledCount / bookings.length : 0,
    };
  }

  private calculateOccupancyRate(bookings: any[]): number {
    if (bookings.length === 0) return 0;

    const totalNights = bookings.reduce((sum, b) => {
      const nights = Math.ceil(
        (new Date(b.checkOut).getTime() - new Date(b.checkIn).getTime()) /
          (1000 * 60 * 60 * 24),
      );
      return sum + nights;
    }, 0);

    // Assuming 30-day period for simplicity
    return Math.min((totalNights / (bookings.length * 30)) * 100, 100);
  }
}
