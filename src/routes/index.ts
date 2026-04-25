import { Router } from "express";
import AuthRoute from "./auth";
import Digiflazz from "./digiflazz";
import ProductRoute from "./product";
import BannerRoute from "./banners";
import PaymentRoute from "./payment";

const router = Router();

router.use('/auth', AuthRoute)
router.use('/digiflazz', Digiflazz)
router.use('/products', ProductRoute)
router.use('/banners', BannerRoute)
router.use('/payment', PaymentRoute)

export default router;