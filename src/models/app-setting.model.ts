import { DataTypes, Sequelize, Model, Optional } from "sequelize";

export interface AppSettingAttributes {
  id: number;
  setting_key: string;
  setting_value: string;
  group: string;
  description?: string | null;
  updated_by?: number | null;
  created_at?: Date;
  updated_at?: Date;
}

type AppSettingCreationAttributes = Optional<AppSettingAttributes, "id" | "created_at" | "updated_at">;

class AppSetting
  extends Model<AppSettingAttributes, AppSettingCreationAttributes>
  implements AppSettingAttributes {
  public id!: number;
  public setting_key!: string;
  public setting_value!: string;
  public group!: string;
  public description?: string | null;
  public updated_by?: number | null;
  public created_at?: Date;
  public updated_at?: Date;
}

export const AppSettingModel = (sequelize: Sequelize) => {
  AppSetting.init(
    {
      id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
      },
      setting_key: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
      },
      setting_value: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      group: {
        type: DataTypes.STRING(50),
        allowNull: false,
        defaultValue: "general",
      },
      description: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      updated_by: {
        type: DataTypes.BIGINT,
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
      tableName: "app_settings",
      schema: "apps",
      timestamps: false,
    }
  );

  return AppSetting;
};