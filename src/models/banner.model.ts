import { DataTypes, Sequelize, Model, Optional } from "sequelize";

export interface BannerAttributes {
  id: number;
  image: string;
  status?: boolean;
  created_at?: Date;
  updated_at?: Date;
}

type BannerCreationAttributes = Optional<
  BannerAttributes,
  "id"
>;

class Banner
  extends Model<BannerAttributes, BannerCreationAttributes>
  implements BannerAttributes {
  public id!: number;
  public image!: string;
  public status?: boolean;
  public created_at?: Date;
  public updated_at?: Date;
}

export const BannerModel = (sequelize: Sequelize) => {
  Banner.init(
    {
      id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
      },
      image: {
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
      tableName: "banner",
      schema: "apps",
      timestamps: false,
    }
  );

  return Banner;
};