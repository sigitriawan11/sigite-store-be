import { QueryTypes } from "sequelize";
import { sequelize_main } from "../databases/main.db";
import { RequestProductCategory, ResponseProductBySlug, ResponseProductCategory } from "../types/product-type";
import { ErrBadRequest } from "../config/errors";

export class ProductRepository {
    static async getProducts (payload: RequestProductCategory) : Promise<ResponseProductCategory> {
        const [result] = await sequelize_main.query<{
            data: ResponseProductCategory
        }>(`select * from apps.f_get_product_categories(:page,:pageSize,:image) as data`, {
            replacements: {
                ...payload,
                image: process.env.URL_BE
            },
            type: QueryTypes.SELECT
        })

        return result!.data
    }

    static async getProductCategoryBySlug (slug:string) : Promise<ResponseProductBySlug> {
        const [result] = await sequelize_main.query<{
            data: ResponseProductBySlug
        }>(`select * from apps.f_get_products_by_category_slug(:slug) as data`, {
            replacements: {
                slug
            },
            type: QueryTypes.SELECT
        })

        if(!result?.data){
            throw new ErrBadRequest("Product Category not found")
        }

        const product = {
            display_name: result?.data.product.display_name!,
            image: process.env.URL_BE + result?.data.product.image!,
            account_config: result?.data.product.account_config!,
        }

        const product_items = result?.data.product_items.map((item) => {
            return {
                ...item,
                icon: process.env.URL_BE + item.icon,
            }
        })

        return {
           product: product!, product_items: product_items!
        }
    }
}