import Xendit from "xendit-node";
import { PaymentRequestParameters } from "xendit-node/payment_request/models";

export class PaymentGateway {
    static xenditClient = new Xendit({
        secretKey: process.env.XENDIT_SECRET_KEY!,
    })

    static async createTransaction() {
        const data: PaymentRequestParameters = {
            "amount": 15000,
            "paymentMethod": {
                "reusability": "ONE_TIME_USE",
                "type": "VIRTUAL_ACCOUNT",
                "virtualAccount": {
                    "channelProperties": {
                        "customerName": "Ahmad Gunawan",
                        "expiresAt": new Date()
                    },
                    "channelCode": "BNI"
                },
                "referenceId": "example-1234"
            },
            "currency": "IDR",
            "referenceId": "example-ref-1234"
        }
    }
}