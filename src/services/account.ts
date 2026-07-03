import { z } from "zod";
import bcrypt from "bcrypt";
import { User } from "../databases/main.db";
import { Validation } from "../validation";
import { ErrBadRequest, ErrNotFound } from "../config/errors";
import { Helpers } from "../helpers/Helpers";
import { AccountRepository } from "../repositories/account";

interface TxListParams {
  page: number;
  pageSize: number;
  status?: string | undefined;
  search?: string | undefined;
}

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
const phoneRegex = /^(08|628)[0-9]{8,11}$/;

const updateProfileSchema = z.object({
  display_name: z.string().min(1, "Display name is required").max(150).optional(),
  phone_number: z
    .string()
    .min(10, "Phone number must be at least 10 digits")
    .max(13, "Phone number must be at most 13 digits")
    .regex(phoneRegex, "Invalid phone number format")
    .optional(),
});

const changePasswordSchema = z.object({
  current_password: z.string().min(1, "Current password is required"),
  new_password: z
    .string()
    .regex(
      passwordRegex,
      "Password must be at least 8 characters and include uppercase, lowercase, and a number"
    ),
});

export class AccountService {
  static async dashboard(userId: string, email: string) {
    return await AccountRepository.dashboardSummary(userId, email);
  }

  static async transactions(userId: string, email: string, params: TxListParams) {
    return await AccountRepository.ownTransactions(userId, email, params);
  }

  static async wallet(userId: string, page: number, pageSize: number) {
    const balance = await AccountRepository.getBalance(userId);
    const { logs, paginate } = await AccountRepository.walletLogs(userId, page, pageSize);
    return { balance, logs, paginate };
  }

  static async updateProfile(userId: string, payload: unknown) {
    const validated = Validation.validate(updateProfileSchema, payload);

    const updateData: Record<string, unknown> = {};
    if (validated.display_name !== undefined) {
      updateData.display_name = validated.display_name;
    }
    if (validated.phone_number !== undefined) {
      updateData.phone_number = Helpers.normalizePhoneNumber(validated.phone_number);
    }

    if (Object.keys(updateData).length === 0) {
      throw new ErrBadRequest("No fields to update");
    }

    updateData.updated_at = new Date();

    const user = await User.findByPk(userId);
    if (!user) {
      throw new ErrNotFound("User not found");
    }

    await User.update(updateData, { where: { id: userId } });

    const updated = await User.findByPk(userId);
    return updated?.get({ plain: true });
  }

  static async changePassword(userId: string, payload: unknown) {
    const { current_password, new_password } = Validation.validate(
      changePasswordSchema,
      payload
    );

    const user = await User.scope("withPassword").findByPk(userId);
    if (!user) {
      throw new ErrNotFound("User not found");
    }

    const currentHash = user.get("password") as string | null;
    if (!currentHash) {
      throw new ErrBadRequest("Password login is not enabled for this account");
    }

    const matches = await bcrypt.compare(current_password, currentHash);
    if (!matches) {
      throw new ErrBadRequest("Current password is incorrect");
    }

    const hashed = await bcrypt.hash(new_password, 12);
    await User.update(
      { password: hashed, updated_at: new Date() as any },
      { where: { id: userId } }
    );

    return true;
  }
}
