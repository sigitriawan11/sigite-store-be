import { DataTypes, Sequelize, Model, Optional } from "sequelize";

export interface ProductCategoryAttributes {
  id: number;
  name: string;
  is_active?: boolean;
  image?: string | null;
  created_at?: Date;
  updated_at?: Date;
}

type ProductCategoryCreationAttributes = Optional<
  ProductCategoryAttributes,
  "id"
>;

class ProductCategory
  extends Model<ProductCategoryAttributes, ProductCategoryCreationAttributes>
  implements ProductCategoryAttributes {
  public id!: number;
  public name!: string;
  public is_active?: boolean;
  public image?: string | null;
  public created_at?: Date;
  public updated_at?: Date;
}

export const ProductCategoryModel = (sequelize: Sequelize) => {
  ProductCategory.init(
    {
      id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      image: {
        type: DataTypes.TEXT,
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
      tableName: "product_categories",
      schema: "apps",
      timestamps: false,
    }
  );

  return ProductCategory;
};