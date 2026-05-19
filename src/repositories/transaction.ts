import { Transaction as SequelizeTransaction } from "sequelize";
import { Transaction } from "../databases/main.db";
import { TransactionAttributes } from "../models/transaction.model";
import { PaymentType, TransactionStatus } from "../types/transaction-type";

type CreateTransactionPayload = Omit<TransactionAttributes, "id" | "created_at" | "updated_at">;

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
    status: TransactionStatus
  ): Promise<void> {
    await Transaction.update({ status }, { where: { ref_id } });
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
