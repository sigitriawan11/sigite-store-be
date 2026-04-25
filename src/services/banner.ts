import { BannerRepositories } from "../repositories/banner";

export class BannerService {
    static async getBanners() {
        return await BannerRepositories.getBanners()
    }
}