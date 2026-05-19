import Xendit from 'xendit-node';
import { PaymentRequestParameters, EWalletChannelCode, QRCodeChannelCode, VirtualAccountChannelCode } from 'xendit-node/payment_request/models';

interface PaymentChannel {
  id: number;
  code: string;
  channel_code: string;
  name: string;
  type: 'QR_CODE' | 'EWALLET' | 'BANK_TRANSFER';
  min_amount: number;
  max_amount: number;
}

interface CreatePaymentOptions {
  amount: number;
  referenceId: string;
  channel: PaymentChannel;
  customerName?: string;
  expiresAt?: Date;
  metadata?: Record<string, unknown>;
}

const xendit = new Xendit({ secretKey: process.env.XENDIT_SECRET_KEY! });
const paymentClient = xendit.PaymentRequest;

export async function createPayment(opts: CreatePaymentOptions) {
  const { amount, referenceId, channel, customerName, expiresAt, metadata } = opts;
  const resolvedMetadata = metadata ?? null;

  if (amount < channel.min_amount || amount > channel.max_amount) {
    throw new Error(
      `Amount must be between ${channel.min_amount} - ${channel.max_amount}`
    );
  }

  let data: PaymentRequestParameters;

  if (channel.type === 'QR_CODE') {
    data = {
      amount,
      currency: 'IDR',
      referenceId,
      metadata: resolvedMetadata,
      paymentMethod: {
        type: 'QR_CODE',
        reusability: 'ONE_TIME_USE',
        qrCode: { channelCode: channel.code as QRCodeChannelCode },
      },
    };
  } else if (channel.type === 'EWALLET') {
    data = {
      amount,
      currency: 'IDR',
      referenceId,
      metadata: resolvedMetadata,
      paymentMethod: {
        type: 'EWALLET',
        reusability: 'ONE_TIME_USE',
        ewallet: { channelCode: channel.code as EWalletChannelCode },
      },
    };
  } else if (channel.type === 'BANK_TRANSFER') {
    if (!customerName) throw new Error('customerName is required for Virtual Account');
    data = {
      amount,
      currency: 'IDR',
      referenceId,
      metadata: resolvedMetadata,
      paymentMethod: {
        type: 'VIRTUAL_ACCOUNT',
        reusability: 'ONE_TIME_USE',
        referenceId: referenceId,
        virtualAccount: {
          channelCode: channel.code as VirtualAccountChannelCode,
          channelProperties: {
            customerName,
            ...(expiresAt && { expiresAt }),
          },
        },
      },
    };
  } else {
    throw new Error(`Channel type not supported: ${channel.type}`);
  }

  return paymentClient.createPaymentRequest({ data });
}