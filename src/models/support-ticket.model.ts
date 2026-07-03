import { DataTypes, Sequelize, Model, Optional } from "sequelize";

export interface SupportTicketAttributes {
  id: number;
  ticket_no: string;
  user_id: string | null;
  requester_name: string | null;
  requester_email: string | null;
  subject: string;
  category: string;
  priority: string;
  status: string;
  created_at?: Date;
  updated_at?: Date;
}

type SupportTicketCreationAttributes = Optional<
  SupportTicketAttributes,
  "id" | "created_at" | "updated_at" | "user_id" | "requester_name" | "requester_email" | "category" | "priority" | "status"
>;

class SupportTicket
  extends Model<SupportTicketAttributes, SupportTicketCreationAttributes>
  implements SupportTicketAttributes {
  public id!: number;
  public ticket_no!: string;
  public user_id!: string | null;
  public requester_name!: string | null;
  public requester_email!: string | null;
  public subject!: string;
  public category!: string;
  public priority!: string;
  public status!: string;
  public created_at?: Date;
  public updated_at?: Date;
}

export const SupportTicketModel = (sequelize: Sequelize) => {
  SupportTicket.init(
    {
      id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
      },
      ticket_no: {
        type: DataTypes.STRING(30),
        allowNull: false,
        unique: true,
      },
      user_id: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      requester_name: {
        type: DataTypes.STRING(150),
        allowNull: true,
      },
      requester_email: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      subject: {
        type: DataTypes.STRING(200),
        allowNull: false,
      },
      category: {
        type: DataTypes.STRING(50),
        allowNull: false,
        defaultValue: "general",
      },
      priority: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: "normal",
      },
      status: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: "OPEN",
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
      tableName: "support_tickets",
      schema: "apps",
      timestamps: false,
    }
  );

  return SupportTicket;
};
