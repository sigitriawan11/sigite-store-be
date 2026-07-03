import { AuthProviderModel } from "../models/auth-provider.model";
import { AppSettingModel } from "../models/app-setting.model";
import { BannerModel } from "../models/banner.model";
import { MarginSettingModel } from "../models/margin-setting.model";
import { ProductCategoryModel } from "../models/product-category.model";
import { ProductModel } from "../models/product.model";
import { TransactionModel } from "../models/transaction.model";
import { UserSessionModel } from "../models/user-session.model";
import { UserModel } from "../models/user.model";
import { AuditLogModel } from "../models/audit-log.model";
import { SupportTicketModel } from "../models/support-ticket.model";
import { SupportTicketMessageModel } from "../models/support-ticket-message.model";
import { DepositModel } from "../models/deposit.model";
import DatabaseManager from "./index";

const sequelize_main = DatabaseManager.getDB("main");

const User = UserModel(sequelize_main);
const Session = UserSessionModel(sequelize_main);
const AuthProvider = AuthProviderModel(sequelize_main);
const ProductCategory = ProductCategoryModel(sequelize_main);
const Product = ProductModel(sequelize_main);
const MarginSetting = MarginSettingModel(sequelize_main);
const Banner = BannerModel(sequelize_main);
const Transaction = TransactionModel(sequelize_main);
const AppSetting = AppSettingModel(sequelize_main);
const AuditLog = AuditLogModel(sequelize_main);
const SupportTicket = SupportTicketModel(sequelize_main);
const SupportTicketMessage = SupportTicketMessageModel(sequelize_main);
const Deposit = DepositModel(sequelize_main);

export { sequelize_main, User, Session, AuthProvider, ProductCategory, Product, MarginSetting, Banner, Transaction, AppSetting, AuditLog, SupportTicket, SupportTicketMessage, Deposit };
