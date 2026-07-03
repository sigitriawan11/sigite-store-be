import { DataTypes, Sequelize, Model, Optional } from "sequelize";

export interface AuditLogAttributes {
  id: number;
  user_id: string | null;
  actor_email: string | null;
  action: string;
  resource: string | null;
  resource_id: string | null;
  method: string | null;
  path: string | null;
  status_code: number | null;
  ip_address: string | null;
  metadata: Record<string, unknown>;
  created_at?: Date;
}

type AuditLogCreationAttributes = Optional<
  AuditLogAttributes,
  "id" | "created_at" | "user_id" | "actor_email" | "resource" | "resource_id" | "method" | "path" | "status_code" | "ip_address" | "metadata"
>;

class AuditLog
  extends Model<AuditLogAttributes, AuditLogCreationAttributes>
  implements AuditLogAttributes {
  public id!: number;
  public user_id!: string | null;
  public actor_email!: string | null;
  public action!: string;
  public resource!: string | null;
  public resource_id!: string | null;
  public method!: string | null;
  public path!: string | null;
  public status_code!: number | null;
  public ip_address!: string | null;
  public metadata!: Record<string, unknown>;
  public created_at?: Date;
}

export const AuditLogModel = (sequelize: Sequelize) => {
  AuditLog.init(
    {
      id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
      },
      user_id: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      actor_email: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      action: {
        type: DataTypes.STRING(20),
        allowNull: false,
      },
      resource: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      resource_id: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      method: {
        type: DataTypes.STRING(10),
        allowNull: true,
      },
      path: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      status_code: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      ip_address: {
        type: DataTypes.STRING(64),
        allowNull: true,
      },
      metadata: {
        type: DataTypes.JSONB,
        allowNull: false,
        defaultValue: {},
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    },
    {
      sequelize,
      tableName: "audit_logs",
      schema: "apps",
      timestamps: false,
    }
  );

  return AuditLog;
};
