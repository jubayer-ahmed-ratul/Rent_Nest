import { confirmPaymentPayload, createPaymentPayload } from "./payment.interface";

const createPaymentIntoDB = async (tenantId: string, payload: createPaymentPayload) => {};

const confirmPaymentIntoDB = async (payload: confirmPaymentPayload) => {};

const getMyPaymentsFromDB = async (tenantId: string) => {};

const getPaymentByIdFromDB = async (id: string) => {};

export const paymentService = {
  createPaymentIntoDB,
  confirmPaymentIntoDB,
  getMyPaymentsFromDB,
  getPaymentByIdFromDB,
};
