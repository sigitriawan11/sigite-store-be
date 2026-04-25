import { DataTypes, Sequelize, Model, Optional } from "sequelize";

export interface ProductAttributes {
  id: number;
  code: string;
  product_name: string;
  brand_id: number;
  price: number;
  status?: boolean;
  raw_json?: object | null;
  created_at?: Date;
  updated_at?: Date;
}

type ProductCreationAttributes = Optional<ProductAttributes, "id">;

class Product
  extends Model<ProductAttributes, ProductCreationAttributes>
  implements ProductAttributes {
  public id!: number;
  public code!: string;
  public product_name!: string;
  public brand_id!: number;
  public price!: number;
  public status?: boolean;
  public raw_json?: object | null;
  public created_at?: Date;
  public updated_at?: Date;
}

export const ProductModel = (sequelize: Sequelize) => {
  Product.init(
    {
      id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
      },
      code: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
      },
      product_name: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      brand_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      price: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
      },
      status: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      raw_json: {
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
      tableName: "products",
      schema: "apps",
      timestamps: false,
    }
  );

  return Product;
};