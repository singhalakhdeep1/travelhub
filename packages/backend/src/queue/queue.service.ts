import { Injectable } from '@nestjs/common';
import Queue from 'bull';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class QueueService {
  private bookingQueue: Queue;
  private notificationQueue: Queue;

  constructor(private notificationsService: NotificationsService) {
    this.bookingQueue = new Queue('bookings', {
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
      },
    });

    this.notificationQueue = new Queue('notifications', {
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
      },
    });

    this.setupProcessors();
  }

  private setupProcessors() {
    this.bookingQueue.process('booking-confirmation', async (job) => {
      const { bookingId } = job.data;
      await this.notificationsService.sendBookingConfirmation(bookingId);
    });

    this.notificationQueue.process('send-email', async (job) => {
      const { to, subject, html } = job.data;
      await this.notificationsService.sendEmail(to, subject, html);
    });
  }

  async add(queueName: string, data: any) {
    if (queueName === 'booking-confirmation') {
      await this.bookingQueue.add(queueName, data);
    } else if (queueName === 'send-email') {
      await this.notificationQueue.add(queueName, data);
    }
  }
}
