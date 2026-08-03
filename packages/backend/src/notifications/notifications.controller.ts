import { Controller, Post, Body } from '@nestjs/common';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
export class NotificationsController {
  constructor(private notificationsService: NotificationsService) {}

  @Post('email')
  sendEmail(@Body() body: { to: string; subject: string; html: string }) {
    return this.notificationsService.sendEmail(body.to, body.subject, body.html);
  }

  @Post('booking-confirmation')
  sendBookingConfirmation(@Body() body: { bookingId: string }) {
    return this.notificationsService.sendBookingConfirmation(body.bookingId);
  }

  @Post('booking-cancellation')
  sendBookingCancellation(@Body() body: { bookingId: string }) {
    return this.notificationsService.sendBookingCancellation(body.bookingId);
  }

  @Post('review-notification')
  sendReviewNotification(@Body() body: { reviewId: string }) {
    return this.notificationsService.sendReviewNotification(body.reviewId);
  }
}
