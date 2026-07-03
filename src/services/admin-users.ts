import { AdminUserRepository } from "../repositories/admin-users";
import { ErrBadRequest } from "../config/errors";
import { z } from "zod";

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
const phoneRegex = /^(08|628)[0-9]{8,11}$/;

const createUserSchema = z.object({
  email: z.string().email("Invalid email format").min(1, "Email is required"),
  password: z
    .string()
    .regex(
      passwordRegex,
      "Password must be at least 8 characters and include uppercase, lowercase, and a number"
    ),
  display_name: z.string().min(1, "Display name is required"),
  phone_number: z
    .string()
    .min(10, "Phone number must be at least 10 digits")
    .max(13, "Phone number must be at most 13 digits")
    .regex(phoneRegex, "Invalid phone number format"),
  role_id: z.string().uuid("Invalid role ID"),
  is_active: z.boolean().optional(),
  is_verified: z.boolean().optional(),
});

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

export class AdminUserService {
  static async listUsers(payload: ListUsersParams) {
    return await AdminUserRepository.listUsers(payload);
  }

  static async getUserById(id: string) {
    return await AdminUserRepository.getUserById(id);
  }

  static async createUser(payload: unknown) {
    const validated = createUserSchema.parse(payload);

    return await AdminUserRepository.createUser({
      ...validated,
      is_active: validated.is_active ?? true,
      is_verified: validated.is_verified ?? false,
    });
  }

  static async updateUser(id: string, payload: UpdateUserPayload, currentUserId: string) {
    if (id === currentUserId) {
      if (payload.is_active === false) {
        throw new ErrBadRequest("Cannot deactivate your own account");
      }
    }

    return await AdminUserRepository.updateUser(id, payload);
  }

  static async softDeleteUser(id: string, currentUserId: string) {
    if (id === currentUserId) {
      throw new ErrBadRequest("Cannot delete your own account");
    }

    return await AdminUserRepository.softDeleteUser(id);
  }
}