import { Injectable } from '@nestjs/common';
import nodemailer from 'nodemailer';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificationsService {
  private transporter: nodemailer.Transporter;

  constructor(private prisma: PrismaService) {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async sendEmail(to: string, subject: string, html: string) {
    await this.transporter.sendMail({
      from: process.env.SMTP_USER,
      to,
      subject,
      html,
    });
  }

  async sendBookingConfirmation(bookingId: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        property: true,
        user: true,
      },
    });

    if (!booking) return;

    const html = `
      <h1>Booking Confirmed!</h1>
      <p>Dear ${booking.user.firstName},</p>
      <p>Your booking at ${booking.property.name} has been confirmed.</p>
      <p><strong>Check-in:</strong> ${booking.checkIn.toLocaleDateString()}</p>
      <p><strong>Check-out:</strong> ${booking.checkOut.toLocaleDateString()}</p>
      <p><strong>Total:</strong> $${booking.totalPrice}</p>
      <p>Thank you for choosing TravelHub!</p>
    `;

    await this.sendEmail(booking.user.email, 'Booking Confirmed', html);
  }

  async sendBookingCancellation(bookingId: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        property: true,
        user: true,
      },
    });

    if (!booking) return;

    const html = `
      <h1>Booking Cancelled</h1>
      <p>Dear ${booking.user.firstName},</p>
      <p>Your booking at ${booking.property.name} has been cancelled.</p>
      <p>If you made a payment, a refund will be processed within 5-7 business days.</p>
      <p>We hope to see you again soon!</p>
    `;

    await this.sendEmail(booking.user.email, 'Booking Cancelled', html);
  }

  async sendReviewNotification(reviewId: string) {
    const review = await this.prisma.review.findUnique({
      where: { id: reviewId },
      include: {
        property: true,
        user: true,
      },
    });

    if (!review) return;

    const html = `
      <h1>New Review Received!</h1>
      <p>Dear ${review.property.host.firstName},</p>
      <p>You have received a new review for ${review.property.name}.</p>
      <p><strong>Rating:</strong> ${review.rating}/5</p>
      <p><strong>Comment:</strong> ${review.comment || 'No comment provided'}</p>
      <p>Keep up the great work!</p>
    `;

    await this.sendEmail(review.property.host.email, 'New Review Received', html);
  }
}
