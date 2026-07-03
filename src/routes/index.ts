import { Router } from "express";
import AuthRoute from "./auth";
import Digiflazz from "./digiflazz";
import ProductRoute from "./product";
import BannerRoute from "./banners";
import PaymentRoute from "./payment";
import MenuRoute from "./menu";
import AdminProductRoute from "./admin/products";
import AdminCategoryRoute from "./admin/categories";
import AdminPricingRoute from "./admin/pricing";
import AdminSettingRoute from "./admin/settings";
import AdminUserRoute from "./admin/users";
import AdminDashboardRoute from "./admin/dashboard";
import AdminOrderRoute from "./admin/orders";
import AdminReportRoute from "./admin/reports";
import AdminAuditRoute from "./admin/audit";
import AdminSupportRoute from "./admin/support";
import AdminPaymentSimRoute from "./admin/payment-sim";
import AdminDepositRoute from "./admin/deposits";
import AccountRoute from "./account";
import PublicSettingRoute from "./settings";
import { auditMiddleware } from "../middlerware/audit-middleware";

const router = Router();

router.use("/admin", auditMiddleware);

router.use('/auth', AuthRoute)
router.use('/digiflazz', Digiflazz)
router.use('/products', ProductRoute)
router.use('/banners', BannerRoute)
router.use('/payment', PaymentRoute)
router.use('/menus', MenuRoute)
router.use('/admin/products', AdminProductRoute)
router.use('/admin/categories', AdminCategoryRoute)
router.use('/admin/pricing', AdminPricingRoute)
router.use('/admin/users', AdminUserRoute)
router.use('/admin/settings', AdminSettingRoute)
router.use('/admin/dashboard', AdminDashboardRoute)
router.use('/admin/orders', AdminOrderRoute)
router.use('/admin/reports', AdminReportRoute)
router.use('/admin/audit', AdminAuditRoute)
router.use('/admin/support', AdminSupportRoute)
router.use('/admin/payment-sim', AdminPaymentSimRoute)
router.use('/admin/deposits', AdminDepositRoute)
router.use('/account', AccountRoute)
router.use('/settings', PublicSettingRoute)

export default router;
