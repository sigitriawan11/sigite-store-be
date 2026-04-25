import { PaymentRepository } from "../repositories/payment";

export class PaymentService {
    static async getPaymentChannels() {
        return await PaymentRepository.getPaymentChannels()
    }
}
