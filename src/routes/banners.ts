import { NextFunction, Request, Response, Router } from "express";
import { BannerService } from "../services/banner";

const BannerRoute = Router();

BannerRoute.get('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = await BannerService.getBanners()

        res.status(200).json({
            status: true,
            message: "Successfully get data banner",
            data
        })
    } catch (error) {
        next(error)
    }
})


export default BannerRoute;