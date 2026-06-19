import { Transaction as SequelizeTransaction } from "sequelize";
import { Transaction } from "../databases/main.db";
import { TransactionAttributes } from "../models/transaction.model";
import { PaymentType, TransactionStatus } from "../types/transaction-type";

type CreateTransactionPayload = Omit<TransactionAttributes, "id" | "created_at" | "updated_at" | "status_provider" | "paid_at"> & {
  status_provider?: string | null;
  paid_at?: Date | null;
};

export class TransactionRepository {
  static async create(
    payload: CreateTransactionPayload,
    t?: SequelizeTransaction
  ): Promise<TransactionAttributes> {
    const transaction = await Transaction.create(payload, { transaction: t! });
    return transaction.toJSON() as TransactionAttributes;
  }

  static async updateStatus(
    ref_id: string,
    status: TransactionStatus,
    extra?: Partial<Pick<TransactionAttributes, "paid_at" | "status_provider">>
  ): Promise<void> {
    const updateData: Partial<TransactionAttributes> = { status };

    if (status === "PAID" && extra?.paid_at) {
      updateData.paid_at = extra.paid_at;
    }
    if (extra?.status_provider !== undefined) {
      updateData.status_provider = extra.status_provider;
    }

    await Transaction.update(updateData, { where: { ref_id } });
  }

  static async findByRefId(ref_id: string): Promise<TransactionAttributes | null> {
    const transaction = await Transaction.findOne({ where: { ref_id } });
    return transaction ? (transaction.toJSON() as TransactionAttributes) : null;
  }

  static async findByXenditId(xendit_id: string): Promise<TransactionAttributes | null> {
    const transaction = await Transaction.findOne({ where: { xendit_id } });
    return transaction ? (transaction.toJSON() as TransactionAttributes) : null;
  }
}
