import { Op } from "sequelize";
import { User } from "../databases/main.db";
import { ErrBadRequest } from "../config/errors";
import { ROLES } from "../constant/role";
import { Helpers } from "../helpers/Helpers";
import bcrypt from "bcrypt";

interface ListUsersParams {
  page: number;
  pageSize: number;
  search: string;
}

interface UpdateUserPayload {
  display_name?: string;
  phone_number?: string;
  role_id?: string;
  is_active?: boolean;
  is_verified?: boolean;
}

interface CreateUserPayload {
  email: string;
  password: string;
  display_name: string;
  phone_number: string;
  role_id: string;
  is_active: boolean;
  is_verified: boolean;
}

export class AdminUserRepository {
  static async listUsers(payload: ListUsersParams) {
    const { page, pageSize, search } = payload;

    const where: Record<string, unknown> = {
        deleted_at: null
    };

    if (search) {
      where[Op.or as any] = [
        { email: { [Op.iLike]: `%${search}%` } },
        { display_name: { [Op.iLike]: `%${search}%` } },
        { phone_number: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const { rows, count } = await User.unscoped().findAndCountAll({
      where,
      attributes: { exclude: ["password"] },
      limit: pageSize,
      offset: (page - 1) * pageSize,
      order: [["created_at", "DESC"]],
    });

    return {
      data: rows.map((row: any) => row.get({ plain: true })),
      paginate: {
        page,
        pageSize,
        total: count,
      },
    };
  }

  static async getUserById(id: string) {
    const user = await User.unscoped().findByPk(id, {
      attributes: { exclude: ["password"] },
    });

    if (!user) {
      throw new ErrBadRequest("User not found");
    }

    return user.get({ plain: true });
  }

  static async createUser(payload: CreateUserPayload) {
    const { email, password, display_name, phone_number, role_id, is_active, is_verified } = payload;

    const existing = await User.unscoped().findOne({
      where: { email: email.toLowerCase() },
    });

    if (existing) {
      throw new ErrBadRequest("Email already registered");
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      email: email.toLowerCase(),
      password: hashedPassword,
      display_name,
      phone_number: Helpers.normalizePhoneNumber(phone_number),
      role_id,
      is_active,
      is_verified,
    });

    const created = await User.unscoped().findByPk(user.id, {
      attributes: { exclude: ["password"] },
    });

    return created?.get({ plain: true });
  }

  static async updateUser(id: string, payload: UpdateUserPayload) {
    const user = await User.unscoped().findByPk(id);

    if (!user) {
      throw new ErrBadRequest("User not found");
    }

    await User.update(payload, {
      where: { id },
      individualHooks: false,
    });

    const updated = await User.unscoped().findByPk(id, {
      attributes: { exclude: ["password"] },
    });

    return updated?.get({ plain: true });
  }

  static async softDeleteUser(id: string) {
    const user = await User.unscoped().findByPk(id);

    if (!user) {
      throw new ErrBadRequest("User not found");
    }

    await User.update(
      { deleted_at: new Date() as any },
      { where: { id } }
    );

    return true;
  }
}