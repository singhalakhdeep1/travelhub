import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PropertiesService } from '../properties/properties.service';
import { PaymentsService } from '../payments/payments.service';
import { QueueService } from '../queue/queue.service';

@Injectable()
export class BookingsService {
  constructor(
    private prisma: PrismaService,
    private propertiesService: PropertiesService,
    private paymentsService: PaymentsService,
    private queue: QueueService,
  ) {}

  async create(data: any) {
    const { userId, propertyId, checkIn, checkOut, guests } = data;

    // Validate dates
    if (new Date(checkIn) >= new Date(checkOut)) {
      throw new BadRequestException('Check-out date must be after check-in date');
    }

    // Check property availability
    const isAvailable = await this.propertiesService.checkAvailability(
      propertyId,
      new Date(checkIn),
      new Date(checkOut),
    );

    if (!isAvailable) {
      throw new BadRequestException('Property is not available for these dates');
    }

    // Get property details
    const property = await this.propertiesService.findById(propertyId);
    if (guests > property.maxGuests) {
      throw new BadRequestException('Number of guests exceeds maximum capacity');
    }

    // Calculate total price
    const nights = Math.ceil(
      (new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24),
    );
    const totalPrice = property.basePrice * nights;

    // Create booking
    const booking = await this.prisma.booking.create({
      data: {
        userId,
        propertyId,
        checkIn: new Date(checkIn),
        checkOut: new Date(checkOut),
        guests,
        totalPrice,
        status: 'PENDING',
      },
      include: {
        property: true,
        user: true,
      },
    });

    // Add to queue for processing
    await this.queue.add('booking-confirmation', { bookingId: booking.id });

    return booking;
  }

  async findAll(userId?: string) {
    const where = userId ? { userId } : {};
    return this.prisma.booking.findMany({
      where,
      include: {
        property: true,
        user: true,
        payments: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: {
        property: true,
        user: true,
        payments: true,
      },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    return booking;
  }

  async update(id: string, data: any) {
    return this.prisma.booking.update({
      where: { id },
      data,
      include: {
        property: true,
        user: true,
      },
    });
  }

  async cancel(id: string) {
    const booking = await this.findById(id);

    if (booking.status === 'CANCELLED') {
      throw new BadRequestException('Booking is already cancelled');
    }

    if (booking.status === 'COMPLETED') {
      throw new BadRequestException('Cannot cancel completed booking');
    }

    // Process refund if payment was made
    if (booking.payments.length > 0) {
      for (const payment of booking.payments) {
        if (payment.status === 'COMPLETED') {
          await this.paymentsService.refund(payment.id);
        }
      }
    }

    return this.prisma.booking.update({
      where: { id },
      data: { status: 'CANCELLED' },
    });
  }

  async getUserBookings(userId: string) {
    return this.prisma.booking.findMany({
      where: { userId },
      include: {
        property: true,
        payments: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
