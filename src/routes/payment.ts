import { Router } from "express";
import { PaymentService } from "../services/payment";

const PaymentRoute = Router();

PaymentRoute.get('/channels', async (req, res, next) => {
    try {
        const data = await PaymentService.getPaymentChannels()
        res.status(200).json({ status: true, message: "Get payment channels success", data })
    } catch (error) {
        next(error)
    }
})

export default PaymentRoute;
