import { Product } from "../databases/main.db";
import { DigiflazzService } from "../services/digiflazz";
import cron from "node-cron";

export const startSyncProductDigiflazzCron = () => {
    cron.schedule("*/5 * * * *", async () => {
        console.log('Start sync product')
        const data = await DigiflazzService.getPriceList()
        
        await Product.bulkCreate(data as any, {
            updateOnDuplicate: [
                "product_name",
                "brand_id",
                "price",
                "status",
                "raw_json",
                "updated_at",
            ],
        });
        console.log('Done sync product')
    });
};