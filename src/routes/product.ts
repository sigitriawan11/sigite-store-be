import { NextFunction, Request, Response, Router } from "express";
import { RoleMiddleware } from "../middlerware/role-middleware";
import { authMiddleware } from "../middlerware/auth-middleware";
import { ProductService } from "../services/product";

const ProductRoute = Router();

ProductRoute.get('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { page = 1, pageSize = 10 } = req.query as { page: string | number, pageSize: string | number }

        const data = await ProductService.getProducts({page, pageSize})

        res.status(200).json({
            status: true,
            message: "Successfully get data products",
            data
        })
    } catch (error) {
        next(error)
    }
})

ProductRoute.get('/:slug', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { slug = null } = req.params as { slug: string | null }

        const data = await ProductService.getProductCategoryBySlug(slug!)

        res.status(200).json({
            status: true,
            message: "Successfully get data products",
            data
        })
    } catch (error) {
        next(error)
    }
})


export default ProductRoute;