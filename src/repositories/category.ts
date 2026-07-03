import { QueryTypes } from "sequelize";
import { sequelize_main } from "../databases/main.db";
import { ProductCategoryModel } from "../models/product-category.model";

export interface CategoryListParams {
    page: number;
    pageSize: number;
    search: string;
}

export interface CategoryCreatePayload {
    name: string;
    display_name: string;
    slug: string;
    image: string | null;
}

export class CategoryRepository {
    static async getCategoryList(payload: CategoryListParams) {
        const [result] = await sequelize_main.query<{
            data: any;
        }>(`select * from apps.f_category_list(:page,:pageSize,:search) as data`, {
            replacements: {
                page: payload.page,
                pageSize: payload.pageSize,
                search: payload.search || '',
            },
            type: QueryTypes.SELECT
        })

        return result!.data
    }

    static async createCategory(payload: CategoryCreatePayload) {
        const ProductCategory = ProductCategoryModel(sequelize_main);
        const result = await ProductCategory.create({
            name: payload.name,
            display_name: payload.display_name,
            slug: payload.slug,
            image: payload.image,
            is_active: true,
        });
        return result;
    }

    static async toggleCategoryStatus(id: number) {
        const ProductCategory = ProductCategoryModel(sequelize_main);
        const category = await ProductCategory.findByPk(id);
        if (!category) {
            return null;
        }
        category.is_active = !category.is_active;
        await category.save();
        return category;
    }

    static async updateCategory(
        id: number,
        payload: Partial<CategoryCreatePayload>
    ) {
        const ProductCategory = ProductCategoryModel(sequelize_main);
        const category = await ProductCategory.findByPk(id);
        if (!category) {
            return null;
        }

        if (payload.name !== undefined) category.name = payload.name;
        if (payload.display_name !== undefined) category.display_name = payload.display_name;
        if (payload.slug !== undefined) category.slug = payload.slug;
        if (payload.image !== undefined && payload.image !== null) category.image = payload.image;

        await category.save();
        return category;
    }
}
