import { DataTypes, Sequelize, Model, Optional } from "sequelize";
import { PaymentType, TransactionStatus } from "../types/transaction-type";

export interface TransactionAttributes {
  id: number;
  ref_id: string;
  user_id?: string | null;
  product_code: string;
  channel_code: string;
  amount: number;
  phone: string;
  email: string;
  account_data: Record<string, unknown>;
  status: TransactionStatus;
  payment_type: PaymentType;
  xendit_id: string | null;
  qr_string: string | null;
  va_number: string | null;
  expired_at: Date | null;
  status_provider: string | null;
  paid_at: Date | null;
  created_at?: Date;
  updated_at?: Date;
}

type TransactionCreationAttributes = Optional<TransactionAttributes, "id">;

class Transaction
  extends Model<TransactionAttributes, TransactionCreationAttributes>
  implements TransactionAttributes {
  public id!: number;
  public ref_id!: string;
  public user_id!: string | null;
  public product_code!: string;
  public channel_code!: string;
  public amount!: number;
  public phone!: string;
  public email!: string;
  public account_data!: Record<string, unknown>;
  public status!: TransactionStatus;
  public payment_type!: PaymentType;
  public xendit_id!: string | null;
  public qr_string!: string | null;
  public va_number!: string | null;
  public expired_at!: Date | null;
  public status_provider!: string | null;
  public paid_at!: Date | null;
  public created_at?: Date;
  public updated_at?: Date;
}

export const TransactionModel = (sequelize: Sequelize) => {
  Transaction.init(
    {
      id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
      },
      ref_id: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
      },
      user_id: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      product_code: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      channel_code: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      amount: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
      },
      phone: {
        type: DataTypes.STRING(20),
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      account_data: {
        type: DataTypes.JSONB,
        allowNull: false,
        defaultValue: {},
      },
      status: {
        type: DataTypes.ENUM('PENDING', 'PAID', 'FAILED', 'EXPIRED'),
        allowNull: false,
        defaultValue: 'PENDING',
      },
      payment_type: {
        type: DataTypes.ENUM('QR_CODE', 'BANK_TRANSFER', 'EWALLET', 'BALANCE'),
        allowNull: false,
      },
      xendit_id: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      qr_string: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      va_number: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      expired_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      status_provider: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      paid_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updated_at: {
        type: DataTypes.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    },
    {
      sequelize,
      tableName: "transactions",
      schema: "apps",
      timestamps: false,
    }
  );

  return Transaction;
};
