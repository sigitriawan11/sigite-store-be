import { ProductRepository } from "../repositories/product";
import { RequestProductCategory } from "../types/product-type";

export class ProductService {
    static async getProducts(payload: RequestProductCategory){
        return await ProductRepository.getProducts(payload)
    }
    static async getProductCategoryBySlug(payload: string){
        return await ProductRepository.getProductCategoryBySlug(payload)
    }
    static async getAdminProductList(payload: {
        page: number;
        pageSize: number;
        search: string;
        categoryId: number | null;
    }){
        return await ProductRepository.getAdminProductList(payload)
    }
}
