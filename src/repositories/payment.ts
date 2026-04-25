import { QueryTypes } from "sequelize";
import { sequelize_main } from "../databases/main.db";

export interface PaymentChannel {
    code: string
    channel_code: string
    name: string
    min: number
    max: number
    image: string
    is_active: boolean
    fee: number | null
}

export interface PaymentChannelGroup {
    type: string
    name: string
    channels: PaymentChannel[]
}

export class PaymentRepository {
    static async getPaymentChannels(): Promise<PaymentChannelGroup[]> {
        const [result] = await sequelize_main.query<{
            data: PaymentChannelGroup[]
        }>(`select * from apps.f_get_payment_channels_grouped(:url_be) as data`, {
            replacements: {
                url_be: process.env.URL_BE
            },
            type: QueryTypes.SELECT
        })

        return result!.data
    }
}
