import { CategoryRepository, CategoryCreatePayload } from "../repositories/category";
import { ErrBadRequest } from "../config/errors";

export interface CategoryListParams {
    page: number;
    pageSize: number;
    search: string;
}

export class CategoryService {
    static async getCategoryList(payload: CategoryListParams) {
        return await CategoryRepository.getCategoryList(payload)
    }

    static async createCategory(payload: CategoryCreatePayload) {
        return await CategoryRepository.createCategory(payload)
    }

    static async toggleCategoryStatus(id: number) {
        const category = await CategoryRepository.toggleCategoryStatus(id);
        if (!category) {
            throw new ErrBadRequest("Category not found");
        }
        return category;
    }

    static async updateCategory(id: number, payload: Partial<CategoryCreatePayload>) {
        const category = await CategoryRepository.updateCategory(id, payload);
        if (!category) {
            throw new ErrBadRequest("Category not found");
        }
        return category;
    }
}
