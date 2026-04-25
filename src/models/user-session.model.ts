import { DataTypes, Sequelize, Model } from "sequelize";

export interface UserSessionAttributes {
  id: string;
  user_id: string;
  access_token?: string;
  refresh_token?: string;
  user_agent?: string;
  ip_address?: string;
  is_revoked?: boolean;
  expires_at?: Date;
  created_at?: Date;
}

class UserSession extends Model<UserSessionAttributes> {
  public id!: string;
  public user_id!: string;
  public access_token?: string;
  public refresh_token?: string;
  public user_agent?: string;
  public ip_address?: string;
  public is_revoked?: boolean;
  public expires_at?: Date;
  public created_at?: Date;
}

export const UserSessionModel = (sequelize: Sequelize) => {
  UserSession.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
      },
      user_id: {
        type: DataTypes.UUID
      },
      access_token: {
        type: DataTypes.TEXT,
      },
      refresh_token: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      user_agent: {
        type: DataTypes.TEXT,
      },
      ip_address: {
        type: DataTypes.STRING(50),
      },
      is_revoked: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      expires_at: {
        type: DataTypes.DATE,
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    },
    {
      sequelize,
      tableName: "user_sessions",
      schema: "apps",
      timestamps: false,
    }
  );

  return UserSession;
};