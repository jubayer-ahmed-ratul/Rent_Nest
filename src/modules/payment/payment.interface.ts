export interface createPaymentPayload {
  rentalRequestId: string;
}

export interface confirmPaymentPayload {
  transactionId: string;
  rentalRequestId: string;
}
