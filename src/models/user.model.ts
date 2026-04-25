import { DataTypes, Sequelize, Model, Optional } from "sequelize";

export interface UserAttributes {
  id: string;
  email?: string;
  password?: string | null;
  display_name?: string;
  phone_number?: string;
  is_active?: boolean;
  is_verified?: boolean;
  role_id?: string;
  failed_login_attempt?: number;
  locked_until?: Date | null;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date | null;
}

type UserCreationAttributes = Optional<UserAttributes, "id">;

class User extends Model<UserAttributes, UserCreationAttributes>
  implements UserAttributes {
  public id!: string;
  public email?: string;
  public password?: string | null;
  public display_name?: string;
  public phone_number?: string;
  public is_active?: boolean;
  public is_verified?: boolean;
  public role_id?: string;
  public failed_login_attempt?: number;
  public locked_until?: Date | null;
  public created_at?: Date;
  public updated_at?: Date;
  public deleted_at?: Date | null;
}

export const UserModel = (sequelize: Sequelize) => {
  User.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal("gen_random_uuid()"),
      },
      email: {
        type: DataTypes.STRING(255),
        unique: true,
      },
      password: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      display_name: {
        type: DataTypes.STRING(150),
      },
      phone_number: {
        type: DataTypes.STRING(20),
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      is_verified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      role_id: {
        type: DataTypes.UUID,
      },
      failed_login_attempt: {
        type: DataTypes.NUMBER,
      },
      locked_until: {
        type: DataTypes.DATE,
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updated_at: {
        type: DataTypes.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      deleted_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      sequelize,
      tableName: "users",
      schema: "apps",
      timestamps: false,
      scopes: {
        withPassword: {
          attributes: {
            include: ["password"]
          }
        }
      },
      defaultScope: {
        attributes: {
          exclude: ["password", "deleted_at"]
        }
      }
    }
  );

  return User;
};