import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('payments')
@UseGuards(JwtAuthGuard)
export class PaymentsController {
  constructor(private paymentsService: PaymentsService) {}

  @Post('create-intent')
  createPaymentIntent(@Body() body: { bookingId: string }) {
    return this.paymentsService.createPaymentIntent(body.bookingId);
  }

  @Post('confirm')
  confirmPayment(@Body() body: { paymentIntentId: string }) {
    return this.paymentsService.confirmPayment(body.paymentIntentId);
  }

  @Post('refund/:id')
  refund(@Param('id') id: string) {
    return this.paymentsService.refund(id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.paymentsService.getPayment(id);
  }
}
