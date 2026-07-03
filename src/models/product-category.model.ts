import { DataTypes, Sequelize, Model, Optional } from "sequelize";

export interface ProductCategoryAttributes {
  id: number;
  name: string;
  display_name?: string | null;
  slug?: string | null;
  is_active?: boolean;
  image?: string | null;
  account_config?: object | null;
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
  public display_name?: string | null;
  public slug?: string | null;
  public is_active?: boolean;
  public image?: string | null;
  public account_config?: object | null;
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
      display_name: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      slug: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      image: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      account_config: {
        type: DataTypes.JSONB,
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