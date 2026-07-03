import { DataTypes, Sequelize, Model, Optional } from "sequelize";

export interface DepositAttributes {
  id: number;
  user_id: string;
  amount: number;
  method: string;
  sender_name: string | null;
  proof_url: string | null;
  status: string;
  admin_note: string | null;
  confirmed_by: string | null;
  confirmed_at: Date | null;
  created_at?: Date;
  updated_at?: Date;
}

type DepositCreationAttributes = Optional<
  DepositAttributes,
  "id" | "created_at" | "updated_at" | "sender_name" | "proof_url" | "status" | "admin_note" | "confirmed_by" | "confirmed_at" | "method"
>;

class Deposit
  extends Model<DepositAttributes, DepositCreationAttributes>
  implements DepositAttributes {
  public id!: number;
  public user_id!: string;
  public amount!: number;
  public method!: string;
  public sender_name!: string | null;
  public proof_url!: string | null;
  public status!: string;
  public admin_note!: string | null;
  public confirmed_by!: string | null;
  public confirmed_at!: Date | null;
  public created_at?: Date;
  public updated_at?: Date;
}

export const DepositModel = (sequelize: Sequelize) => {
  Deposit.init(
    {
      id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
      },
      user_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      amount: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
      },
      method: {
        type: DataTypes.STRING(50),
        allowNull: false,
        defaultValue: "bank_transfer",
      },
      sender_name: {
        type: DataTypes.STRING(150),
        allowNull: true,
      },
      proof_url: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      status: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: "PENDING",
      },
      admin_note: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      confirmed_by: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      confirmed_at: {
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
      tableName: "deposits",
      schema: "apps",
      timestamps: false,
    }
  );

  return Deposit;
};
