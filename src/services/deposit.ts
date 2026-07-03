import { z } from "zod";
import { QueryTypes } from "sequelize";
import { Deposit, sequelize_main } from "../databases/main.db";
import { DepositRepository } from "../repositories/deposit";
import { Validation } from "../validation";
import { ErrBadRequest, ErrNotFound } from "../config/errors";

interface ListParams {
  page: number;
  pageSize: number;
  status?: string | undefined;
  search?: string | undefined;
}

const createDepositSchema = z.object({
  amount: z.coerce.number().positive("Amount must be greater than 0").max(100000000, "Amount too large"),
  method: z.string().min(1).max(50).optional(),
  sender_name: z.string().max(150).optional(),
});

const rejectSchema = z.object({
  admin_note: z.string().min(1, "Rejection note is required").max(500),
});

export class DepositService {
  static async create(userId: string, payload: unknown, proofUrl: string | null) {
    const validated = Validation.validate(createDepositSchema, payload);
    return await DepositRepository.create({
      user_id: userId,
      amount: validated.amount,
      method: validated.method ?? "bank_transfer",
      sender_name: validated.sender_name ?? null,
      proof_url: proofUrl,
    });
  }

  static async listForUser(userId: string, params: ListParams) {
    return await DepositRepository.listForUser(userId, params);
  }

  static async listForAdmin(params: ListParams) {
    return await DepositRepository.listForAdmin(params);
  }

  static async detail(id: number) {
    return await DepositRepository.getById(id);
  }

  static async confirm(id: number, adminId: string) {
    return await sequelize_main.transaction(async (t) => {
      const deposit = await Deposit.findByPk(id, { transaction: t, lock: t.LOCK.UPDATE });
      if (!deposit) {
        throw new ErrNotFound("Deposit not found");
      }
      if (deposit.status !== "PENDING") {
        throw new ErrBadRequest(`Deposit is already ${deposit.status}`);
      }

      const userId = deposit.user_id;
      const amount = Number(deposit.amount);

      const balRows: any[] = await sequelize_main.query(
        `SELECT balance::float AS balance FROM apps.user_balances WHERE user_id = :user_id FOR UPDATE`,
        { replacements: { user_id: userId }, type: QueryTypes.SELECT, transaction: t }
      );

      const balanceBefore = balRows.length ? Number(balRows[0].balance) : 0;
      const balanceAfter = balanceBefore + amount;

      if (balRows.length) {
        await sequelize_main.query(
          `UPDATE apps.user_balances SET balance = :balance, updated_at = NOW() WHERE user_id = :user_id`,
          { replacements: { balance: balanceAfter, user_id: userId }, type: QueryTypes.UPDATE, transaction: t }
        );
      } else {
        await sequelize_main.query(
          `INSERT INTO apps.user_balances (user_id, balance, created_at, updated_at) VALUES (:user_id, :balance, NOW(), NOW())`,
          { replacements: { user_id: userId, balance: balanceAfter }, type: QueryTypes.INSERT, transaction: t }
        );
      }

      await sequelize_main.query(
        `INSERT INTO apps.balance_logs (id, user_id, type, amount, balance_before, balance_after, transaction_id, description, created_at)
         VALUES (gen_random_uuid(), :user_id, 'DEPOSIT', :amount, :before, :after, :tx, :desc, NOW())`,
        {
          replacements: {
            user_id: userId,
            amount,
            before: balanceBefore,
            after: balanceAfter,
            tx: `DEP-${id}`,
            desc: `Manual deposit #${id} approved`,
          },
          type: QueryTypes.INSERT,
          transaction: t,
        }
      );

      await Deposit.update(
        {
          status: "APPROVED",
          confirmed_by: adminId,
          confirmed_at: new Date(),
          updated_at: new Date(),
        },
        { where: { id }, transaction: t }
      );

      const updated = await Deposit.findByPk(id, { transaction: t });
      return updated?.get({ plain: true });
    });
  }

  static async reject(id: number, adminId: string, payload: unknown) {
    const { admin_note } = Validation.validate(rejectSchema, payload);

    const deposit = await Deposit.findByPk(id);
    if (!deposit) {
      throw new ErrNotFound("Deposit not found");
    }
    if (deposit.status !== "PENDING") {
      throw new ErrBadRequest(`Deposit is already ${deposit.status}`);
    }

    await Deposit.update(
      {
        status: "REJECTED",
        admin_note,
        confirmed_by: adminId,
        confirmed_at: new Date(),
        updated_at: new Date(),
      },
      { where: { id } }
    );

    const updated = await Deposit.findByPk(id);
    return updated?.get({ plain: true });
  }
}
