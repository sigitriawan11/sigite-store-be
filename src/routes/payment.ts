import { NextFunction, Request, Response, Router } from "express";
import { PaymentService } from "../services/payment";
import { TransactionService } from "../services/transaction";
import { Validation } from "../validation";
import { TransactionValidation } from "../validation/transaction.validation";

const PaymentRoute = Router();

PaymentRoute.get('/channels', async (req, res, next) => {
    try {
        const data = await PaymentService.getPaymentChannels()
        res.status(200).json({ status: true, message: "Get payment channels success", data })
    } catch (error) {
        next(error)
    }
})

PaymentRoute.get('/invoice/:ref_id', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { ref_id } = req.params as { ref_id: string }
        const data = await TransactionService.getInvoice(ref_id)
        res.status(200).json({ status: true, message: "Get invoice success", data })
    } catch (error) {
        next(error)
    }
})

PaymentRoute.post(
    '/orders',
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const body = Validation.validate(TransactionValidation.createOrder, req.body)
            const data = await TransactionService.createOrder(body)
            res.status(201).json({ status: true, message: "Order created successfully", data })
        } catch (error) {
            console.log(error)
            next({
                status: false,
                message: "Failed to create order",
            })
        }
    }
)

export default PaymentRoute;
