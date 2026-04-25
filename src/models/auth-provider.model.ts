import { DataTypes, Sequelize, Model, Optional } from "sequelize";

export interface AuthProviderAttributes {
  id: string;
  user_id: string;
  provider: string;
  provider_user_id: string;
  access_token?: string;
  refresh_token?: string;
  expires_at?: Date;
  profile?: object;
  created_at?: Date;
}

type AuthProviderCreationAttributes = Optional<AuthProviderAttributes, "id">;

class AuthProvider
  extends Model<AuthProviderAttributes, AuthProviderCreationAttributes>
  implements AuthProviderAttributes {
  public id!: string;
  public user_id!: string;
  public provider!: string;
  public provider_user_id!: string;
  public access_token?: string;
  public refresh_token?: string;
  public expires_at?: Date;
  public profile?: object;
  public created_at?: Date;
}

export const AuthProviderModel = (sequelize: Sequelize) => {
  AuthProvider.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal("gen_random_uuid()"),
      },
      user_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      provider: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      provider_user_id: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      access_token: {
        type: DataTypes.TEXT,
      },
      refresh_token: {
        type: DataTypes.TEXT,
      },
      expires_at: {
        type: DataTypes.DATE,
      },
      profile: {
        type: DataTypes.JSONB,
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    },
    {
      sequelize,
      tableName: "auth_providers",
      schema: "apps",
      timestamps: false,
      indexes: [
        {
          unique: true,
          fields: ["provider", "provider_user_id"],
        },
      ],
    }
  );

  return AuthProvider;
};