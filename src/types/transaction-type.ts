export interface CreateOrderDTO {
  product_code: string;
  channel_code: string;
  phone: string;
  email: string;
  account_data: Record<string, string>;
}

export interface OrderResult {
  ref_id: string;
  amount: number;
  payment_type: 'QR_CODE' | 'BANK_TRANSFER';
  qr_string: string | null;
  va_number: string | null;
  expired_at: string | null;
  xendit_id: string;
}

export interface InvoiceProduct {
  code: string;
  product_name: string;
  icon: string;
  category_name: string;
  category_image: string;
}

export interface InvoiceChannel {
  code: string;
  name: string;
  image: string | null;
  type: PaymentType;
}

export interface InvoiceResult {
  ref_id: string;
  amount: number;
  payment_type: PaymentType;
  status: TransactionStatus;
  status_provider: string | null;
  qr_string: string | null;
  va_number: string | null;
  expired_at: string | null;
  created_at: string;
  phone: string;
  email: string;
  account_data: Record<string, unknown>;
  product: InvoiceProduct;
  channel: InvoiceChannel;
  paid_at: string | null;
}

export type ProviderStatus = 'Pending' | 'Process' | 'Success';

export type TransactionStatus = 'PENDING' | 'PAID' | 'FAILED' | 'EXPIRED';
export type PaymentType = 'QR_CODE' | 'BANK_TRANSFER';
