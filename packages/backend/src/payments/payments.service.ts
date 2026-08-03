import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import Stripe from 'stripe';

@Injectable()
export class PaymentsService {
  private stripe: Stripe;

  constructor(private prisma: PrismaService) {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
      apiVersion: '2023-10-16',
    });
  }

  async createPaymentIntent(bookingId: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: { property: true },
    });

    if (!booking) {
      throw new BadRequestException('Booking not found');
    }

    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: Math.round(booking.totalPrice * 100),
      currency: booking.property.currency || 'usd',
      metadata: {
        bookingId,
      },
    });

    // Create payment record
    const payment = await this.prisma.payment.create({
      data: {
        amount: booking.totalPrice,
        currency: booking.property.currency || 'USD',
        status: 'PENDING',
        stripeId: paymentIntent.id,
        method: 'card',
        bookingId,
        userId: booking.userId,
      },
    });

    return {
      clientSecret: paymentIntent.client_secret,
      paymentId: payment.id,
    };
  }

  async confirmPayment(paymentIntentId: string) {
    const payment = await this.prisma.payment.findFirst({
      where: { stripeId: paymentIntentId },
    });

    if (!payment) {
      throw new BadRequestException('Payment not found');
    }

    await this.prisma.payment.update({
      where: { id: payment.id },
      data: { status: 'COMPLETED' },
    });

    // Update booking status
    await this.prisma.booking.update({
      where: { id: payment.bookingId },
      data: { status: 'CONFIRMED' },
    });

    return payment;
  }

  async refund(paymentId: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
    });

    if (!payment) {
      throw new BadRequestException('Payment not found');
    }

    if (payment.status !== 'COMPLETED') {
      throw new BadRequestException('Payment cannot be refunded');
    }

    const refund = await this.stripe.refunds.create({
      payment_intent: payment.stripeId!,
    });

    await this.prisma.payment.update({
      where: { id: payment.id },
      data: { status: 'REFUNDED' },
    });

    return refund;
  }

  async getPayment(paymentId: string) {
    return this.prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        booking: true,
        user: true,
      },
    });
  }
}
