import { Op } from "sequelize";
import { Transaction } from "../databases/main.db";
import { TransactionAttributes } from "../models/transaction.model";







export const checkExpiredTransactions = async () => {
    const now = new Date();

    try {
        const [affectedCount] = await Transaction.update(
            {
                status: "EXPIRED",
                status_provider: "Expired",
            } as Partial<TransactionAttributes>,
            {
                where: {
                    status: "PENDING",
                    expired_at: {
                        [Op.lte]: now,
                        [Op.ne]: null,
                    },
                },
            }
        );

        if (affectedCount > 0) {
            console.log(`[ExpiredCron] Marked ${affectedCount} transaction(s) as EXPIRED`);
        }
    } catch (error) {
        console.error("[ExpiredCron] Error marking expired transactions:", error);
    }
};