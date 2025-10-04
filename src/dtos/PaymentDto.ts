export interface PaymentDto {
  userId: string;
  amount: number;
  currencyCode: string;
  status: string;
  paymentId: string;
  paymentDate: Date;
}
