import { Banner } from "../databases/main.db";

export class BannerRepositories {
    static async getBanners(){
        const data =  await Banner.findAll({
            where: {
                status: true
            },
            order: [['id', 'asc']],
            raw: true
        })

        return data.map((item) => {
            return {
                ...item,
                image: process.env.URL_BE + item.image
            }
        })
    }
}