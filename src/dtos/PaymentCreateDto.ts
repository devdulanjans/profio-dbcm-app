export interface PaymentCreateDto {
  userId: string;
  amount: number;
  currencyCode: string;
  paymentId: string;
  status: string;
  paymentDate: Date;
  createdAt: Date;
}
