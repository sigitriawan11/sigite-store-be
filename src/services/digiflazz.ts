import axios from "axios";
import md5 from "md5";
import { ErrBadRequest } from "../config/errors";
import { ProductCategory } from "../databases/main.db";
import { Helpers } from "../helpers/Helpers";

type CmdType = 'depo' | 'pricelist' | 'ref_id';

const CMD_CONFIG: Record<CmdType, { url: string; cmd?: string, prefix_sign?: string }> = {
    depo: {
        url: '/cek-saldo',
        cmd: 'deposit',
        prefix_sign: 'depo'
    },
    pricelist: {
        url: '/price-list',
        cmd: 'prepaid',
        prefix_sign: 'pricelist'
    },
    ref_id: {
        url: '/transaction'
    }
};

export class DigiflazzService {
    private static baseUrl = process.env.DIGIFLAZZ_API!;
    private static username = process.env.DIGIFLAZZ_USERNAME!;
    private static apiKey = process.env.DIGIFLAZZ_KEY!;

    static async fetchApiDigiflazz(cmd: CmdType, body: any = {}) {
        try {
            const config = CMD_CONFIG[cmd];

            if (!config) {
                throw new ErrBadRequest(`Invalid cmd: ${cmd}`);
            }

            const sign = md5(
                this.username + this.apiKey + (body.ref_id || config.prefix_sign)
            );

            const payload = {
                username: this.username,
                cmd: config.cmd,
                ...body,
                sign
            };

            const response = await axios.post(
                `${this.baseUrl}${config.url}`,
                payload
            );

            return response.data.data
        } catch (error: any) {
            console.error('Digiflazz Error:', error.response.data);
            throw error;
        }
    }

    static async cekSaldo() {
        return this.fetchApiDigiflazz('depo');
    }

    static async getPriceList() {
        const data = await this.fetchApiDigiflazz('pricelist');

        const data_category_product = await ProductCategory.findAll({
            attributes: ["id", "name"],
            raw: true,
        });

        const brandMap = new Map(
            data_category_product.map((c: any) => [
                Helpers.normalizeUpper(c.name),
                c.id,
            ])
        );

        const mappedProducts = data
            .map((p: any) => {
                const brand_id = brandMap.get(Helpers.normalizeUpper(p.brand));

                if (!brand_id) return null;

                return {
                    code: p.buyer_sku_code,
                    product_name: p.product_name,
                    brand_id,
                    price: Math.ceil(p.price + (p.price * 0.01)),
                    status: p.buyer_product_status,
                    raw_json: p,
                };
            })
            .filter(Boolean);

        return mappedProducts;
    }

    static async createTransaction(body: {
        ref_id: string;
        product_code: string;
        customer_no: string;
    }) {
        return this.fetchApiDigiflazz('ref_id', body);
    }
}