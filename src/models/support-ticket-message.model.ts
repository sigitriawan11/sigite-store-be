import { DataTypes, Sequelize, Model, Optional } from "sequelize";

export interface SupportTicketMessageAttributes {
  id: number;
  ticket_id: number;
  sender_role: string;
  sender_id: string | null;
  sender_name: string | null;
  message: string;
  created_at?: Date;
}

type SupportTicketMessageCreationAttributes = Optional<
  SupportTicketMessageAttributes,
  "id" | "created_at" | "sender_id" | "sender_name" | "sender_role"
>;

class SupportTicketMessage
  extends Model<SupportTicketMessageAttributes, SupportTicketMessageCreationAttributes>
  implements SupportTicketMessageAttributes {
  public id!: number;
  public ticket_id!: number;
  public sender_role!: string;
  public sender_id!: string | null;
  public sender_name!: string | null;
  public message!: string;
  public created_at?: Date;
}

export const SupportTicketMessageModel = (sequelize: Sequelize) => {
  SupportTicketMessage.init(
    {
      id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
      },
      ticket_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      sender_role: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: "user",
      },
      sender_id: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      sender_name: {
        type: DataTypes.STRING(150),
        allowNull: true,
      },
      message: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    },
    {
      sequelize,
      tableName: "support_ticket_messages",
      schema: "apps",
      timestamps: false,
    }
  );

  return SupportTicketMessage;
};
