import { AuthProviderModel } from "../models/auth-provider.model";
import { BannerModel } from "../models/banner.model";
import { ProductCategoryModel } from "../models/product-category.model";
import { ProductModel } from "../models/product.model";
import { TransactionModel } from "../models/transaction.model";
import { UserSessionModel } from "../models/user-session.model";
import { UserModel } from "../models/user.model";
import DatabaseManager from "./index";

const sequelize_main = DatabaseManager.getDB("main");

const User = UserModel(sequelize_main);
const Session = UserSessionModel(sequelize_main);
const AuthProvider = AuthProviderModel(sequelize_main);
const ProductCategory = ProductCategoryModel(sequelize_main);
const Product = ProductModel(sequelize_main);
const Banner = BannerModel(sequelize_main);
const Transaction = TransactionModel(sequelize_main);

export { sequelize_main, User, Session, AuthProvider, ProductCategory, Product, Banner, Transaction };