import { DataTypes, Sequelize, Model, Optional } from "sequelize";

export interface MarginSettingAttributes {
  id: number;
  margin_percent: number;
  updated_by?: number | null;
  created_at?: Date;
  updated_at?: Date;
}

type MarginSettingCreationAttributes = Optional<MarginSettingAttributes, "id">;

class MarginSetting
  extends Model<MarginSettingAttributes, MarginSettingCreationAttributes>
  implements MarginSettingAttributes {
  public id!: number;
  public margin_percent!: number;
  public updated_by?: number | null;
  public created_at?: Date;
  public updated_at?: Date;
}

export const MarginSettingModel = (sequelize: Sequelize) => {
  MarginSetting.init(
    {
      id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
      },
      margin_percent: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 1.00,
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
      tableName: "margin_settings",
      schema: "apps",
      timestamps: false,
    }
  );

  return MarginSetting;
};