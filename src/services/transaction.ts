import { v4 as uuidv4 } from "uuid";
import { QueryTypes } from "sequelize";
import { createPayment } from "./payment-gateway";
import { PaymentRepository } from "../repositories/payment";
import { TransactionRepository } from "../repositories/transaction";
import { sequelize_main } from "../databases/main.db";
import { ErrBadRequest, ErrNotFound } from "../config/errors";
import { CreateOrderDTO, InvoiceResult, OrderResult } from "../types/transaction-type";

export class TransactionService {
  static async getInvoice(ref_id: string): Promise<InvoiceResult> {
    const transaction = await TransactionRepository.findByRefId(ref_id);
    if (!transaction) {
      throw new ErrNotFound(`Invoice '${ref_id}' not found`);
    }

    const [productRow] = await sequelize_main.query<{
      code: string;
      product_name: string;
      icon: string;
      category_name: string;
      category_image: string;
    }>(
      `SELECT
         p.code,
         p.product_name,
         CONCAT(:url_be, p.icon) AS icon,
         pc.display_name AS category_name,
         CONCAT(:url_be, pc.image) AS category_image
       FROM apps.products p
       JOIN apps.product_categories pc ON pc.id = p.brand_id
       WHERE p.code = :code
       LIMIT 1`,
      {
        replacements: { code: transaction.product_code, url_be: process.env.URL_BE },
        type: QueryTypes.SELECT,
      }
    );

    if (!productRow) {
      throw new ErrNotFound(`Product '${transaction.product_code}' not found`);
    }

    const channel = await PaymentRepository.getChannelByCode(transaction.channel_code);

    
    const channelImage = channel.image
      ? channel.image.startsWith("http")
        ? channel.image
        : `${process.env.URL_BE}${channel.image.startsWith("/") ? "" : "/"}${channel.image}`
      : null;

    const isExpired = transaction.status === 'EXPIRED';
    const vaNumber = isExpired ? '-' : (transaction.va_number ?? null);
    const qrString  = isExpired ? '-' : (transaction.qr_string ?? null);

    return {
      ref_id: transaction.ref_id,
      amount: Number(transaction.amount),
      payment_type: transaction.payment_type,
      status: transaction.status,
      status_provider: transaction.status_provider ?? null,
      qr_string: qrString,
      va_number: vaNumber,
      expired_at: transaction.expired_at ? transaction.expired_at.toISOString() : null,
      created_at: transaction.created_at ? transaction.created_at.toISOString() : new Date().toISOString(),
      phone: transaction.phone,
      email: transaction.email,
      account_data: transaction.account_data,
      product: productRow,
      channel: {
        code: channel.code,
        name: channel.name,
        image: channelImage,
        type: channel.type,
      },
      paid_at: transaction.paid_at ? transaction.paid_at.toISOString() : null,
    };
  }

  static async createOrder(dto: CreateOrderDTO): Promise<OrderResult> {
    const channel = await PaymentRepository.getChannelByCode(dto.channel_code);

    const product = await TransactionService.resolveProductPrice(dto.product_code);

    const basePrice = Math.round(Number(product.price));
    const channelFee = Number(channel.fee ?? 0);

    const fee =
      channel.type_fee === "%"
        ? Math.round(basePrice * channelFee)
        : Math.round(channelFee);
    const amount = basePrice + fee;

    if (amount < channel.min || amount > channel.max) {
      throw new ErrBadRequest(
        `Amount Rp${amount} is outside the allowed range Rp${channel.min}-Rp${channel.max} for this payment channel`
      );
    }

    const ref_id = `TRX-${uuidv4().replace(/-/g, "").slice(0, 16).toUpperCase()}`;

    
    let xenditResponse: any;

    if (process.env.NODE_ENV === 'STAGING') {
      
      const now = new Date();
      const expiresAt = new Date(now.getTime() + 2 * 60 * 60 * 1000);

      xenditResponse = {
        id: "STAGING_SANDBOX_" + ref_id,
        paymentMethod: {
          qrCode: channel.type === "QR_CODE"
            ? { channelProperties: { qrString: "STAGING_SANDBOX", expiresAt } }
            : undefined,
          virtualAccount: channel.type === "BANK_TRANSFER"
            ? { channelProperties: { virtualAccountNumber: "1212123456789", expiresAt } }
            : undefined,
        },
      };
    } else {
      
      xenditResponse = await createPayment({
        amount,
        referenceId: ref_id,
        channel: {
          id: 0,
          code: channel.channel_code,
          channel_code: channel.channel_code,
          name: channel.name,
          type: channel.type as 'QR_CODE' | 'BANK_TRANSFER',
          min_amount: channel.min,
          max_amount: channel.max,
        },
        customerName: dto.phone,
        expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000),
        metadata: {
          product_code: dto.product_code,
          phone: dto.phone,
          email: dto.email,
          account_data: dto.account_data,
        },
      });
    }

    const qr_string =
      xenditResponse.paymentMethod?.qrCode?.channelProperties?.qrString ?? null;

    const va_number =
      xenditResponse.paymentMethod?.virtualAccount?.channelProperties
        ?.virtualAccountNumber ?? null;

    const expired_at =
      xenditResponse.paymentMethod?.qrCode?.channelProperties?.expiresAt ??
      xenditResponse.paymentMethod?.virtualAccount?.channelProperties?.expiresAt ??
      null;

    const dbTransaction = await sequelize_main.transaction();
    try {
      await TransactionRepository.create(
        {
          ref_id,
          product_code: dto.product_code,
          channel_code: dto.channel_code,
          amount,
          phone: dto.phone,
          email: dto.email,
          account_data: dto.account_data,
          status: "PENDING",
          payment_type: channel.type as "QR_CODE" | "BANK_TRANSFER",
          xendit_id: xenditResponse.id ?? null,
          qr_string,
          va_number,
          expired_at: expired_at ?? null,
        },
        dbTransaction
      );

      await dbTransaction.commit();
    } catch (err) {
      await dbTransaction.rollback();
      throw err;
    }

    return {
      ref_id,
      amount,
      payment_type: channel.type as "QR_CODE" | "BANK_TRANSFER",
      qr_string,
      va_number,
      expired_at: expired_at ? expired_at.toISOString() : null,
      xendit_id: xenditResponse.id!,
    };
  }

  private static async resolveProductPrice(
    product_code: string
  ): Promise<{ price: number }> {
    const [result] = await sequelize_main.query<{ price: number }>(
      `SELECT price FROM apps.products WHERE code = :code AND status = true LIMIT 1`,
      { replacements: { code: product_code }, type: QueryTypes.SELECT }
    );

    if (!result) {
      throw new ErrBadRequest(`Product '${product_code}' not found`);
    }

    return result;
  }
}