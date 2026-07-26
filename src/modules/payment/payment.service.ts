import Stripe from "stripe";
import config from "../../config";
import { prisma } from "../../lib/prisma";
import { confirmPaymentPayload, createPaymentPayload } from "./payment.interface";

const stripe = new Stripe(config.stripe_secret_key as string);

const createPaymentIntoDB = async (tenantId: string, payload: createPaymentPayload) => {
  const { rentalRequestId } = payload;

  // check rental request exists and is approved
  const rentalRequest = await prisma.rentalRequest.findUnique({
    where: { id: rentalRequestId },
    include: { property: true },
  });

  if (!rentalRequest) throw new Error("Rental request not found");
  if (rentalRequest.tenantId !== tenantId) throw new Error("Unauthorized");
  if (rentalRequest.status !== "APPROVED") throw new Error("Rental request is not approved yet");

  // check if payment already exists
  const existingPayment = await prisma.payment.findUnique({
    where: { rentalRequestId },
  });
  if (existingPayment) throw new Error("Payment already initiated for this rental");

  const amount = rentalRequest.property.price;

  // create stripe payment intent
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(amount * 100), // stripe needs amount in cents
    currency: "usd",
    metadata: { rentalRequestId, tenantId },
  });

  // save payment to DB
  const payment = await prisma.payment.create({
    data: {
      rentalRequestId,
      tenantId,
      amount,
      transactionId: paymentIntent.id,
      status: "PENDING",
      provider: "STRIPE",
    },
  });

  return {
    payment,
    clientSecret: paymentIntent.client_secret,
  };
};

const confirmPaymentIntoDB = async (payload: confirmPaymentPayload) => {
  const { transactionId } = payload;

  // verify payment with stripe
  const paymentIntent = await stripe.paymentIntents.retrieve(transactionId);

  const rentalRequestId = paymentIntent.metadata.rentalRequestId;

  // update payment status
  const payment = await prisma.payment.update({
    where: { rentalRequestId },
    data: {
      status: paymentIntent.status === "succeeded" ? "COMPLETED" : "PENDING",
      paidAt: paymentIntent.status === "succeeded" ? new Date() : null,
    },
  });

  // if succeeded, update rental status to ACTIVE
  if (paymentIntent.status === "succeeded") {
    await prisma.rentalRequest.update({
      where: { id: rentalRequestId },
      data: { status: "ACTIVE" },
    });
  }

  return {
    payment,
    stripeStatus: paymentIntent.status,
  };
};

const getMyPaymentsFromDB = async (tenantId: string) => {
  return await prisma.payment.findMany({
    where: { tenantId },
    include: {
      rentalRequest: { include: { property: true } },
    },
    orderBy: { createdAt: "desc" },
  });
};

const getPaymentByIdFromDB = async (id: string) => {
  const payment = await prisma.payment.findUnique({
    where: { id },
    include: {
      rentalRequest: { include: { property: true } },
      tenant: { omit: { password: true } },
    },
  });

  if (!payment) throw new Error("Payment not found");

  return payment;
};

export const paymentService = {
  createPaymentIntoDB,
  confirmPaymentIntoDB,
  getMyPaymentsFromDB,
  getPaymentByIdFromDB,
};
