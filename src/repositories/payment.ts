import { QueryTypes } from "sequelize";
import { sequelize_main } from "../databases/main.db";
import { ErrBadRequest } from "../config/errors";

export interface PaymentChannel {
    code: string
    channel_code: string
    name: string
    type: 'QR_CODE' | 'BANK_TRANSFER'
    min: number
    max: number
    image: string
    is_active: boolean
    fee: number | null
    type_fee: '%' | '+'
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

    static async getChannelByCode(code: string): Promise<PaymentChannel> {
        const [result] = await sequelize_main.query<{
            data: PaymentChannel | null
        }>(`select * from apps.f_get_payment_channel_by_code(:code) as data`, {
            replacements: { code },
            type: QueryTypes.SELECT
        })

        if (!result?.data) {
            throw new ErrBadRequest(`Payment channel '${code}' not found or inactive`)
        }

        return result.data
    }
}
