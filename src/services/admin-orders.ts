import { z } from "zod";
import { AdminOrderRepository } from "../repositories/admin-orders";
import { Validation } from "../validation";
import { TransactionStatus } from "../types/transaction-type";

interface ListOrdersParams {
  page: number;
  pageSize: number;
  search: string;
  status?: string | undefined;
  date_from?: string | undefined;
  date_to?: string | undefined;
}

const updateStatusSchema = z.object({
  status: z.enum(["PENDING", "PAID", "FAILED", "EXPIRED"]),
});

export class AdminOrderService {
  static async list(payload: ListOrdersParams) {
    return await AdminOrderRepository.list(payload);
  }

  static async detail(ref_id: string) {
    return await AdminOrderRepository.getByRefId(ref_id);
  }

  static async updateStatus(ref_id: string, payload: unknown) {
    const { status } = Validation.validate(updateStatusSchema, payload);
    return await AdminOrderRepository.updateStatus(ref_id, status as TransactionStatus);
  }
}
