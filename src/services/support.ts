import { z } from "zod";
import { SupportRepository } from "../repositories/support";
import { Validation } from "../validation";
import { ErrBadRequest } from "../config/errors";

interface ListTicketsParams {
  page: number;
  pageSize: number;
  search: string;
  status?: string | undefined;
}

const updateStatusSchema = z.object({
  status: z.enum(["OPEN", "PENDING", "RESOLVED", "CLOSED"]),
});

const replySchema = z.object({
  message: z.string().min(1, "Message is required").max(5000, "Message is too long"),
});

const createTicketSchema = z.object({
  subject: z.string().min(1, "Subject is required").max(200),
  category: z.string().max(50).optional(),
  message: z.string().min(1, "Message is required").max(5000),
});

interface UserActor {
  user_id: string;
  name?: string | null;
  email?: string | null;
}

interface Actor {
  user_id?: string | null;
  name?: string | null;
}

export class SupportService {
  static async list(payload: ListTicketsParams) {
    return await SupportRepository.list(payload);
  }

  static async detail(id: number) {
    if (!Number.isFinite(id)) {
      throw new ErrBadRequest("Invalid ticket id");
    }
    return await SupportRepository.getById(id);
  }

  static async updateStatus(id: number, payload: unknown) {
    if (!Number.isFinite(id)) {
      throw new ErrBadRequest("Invalid ticket id");
    }
    const { status } = Validation.validate(updateStatusSchema, payload);
    return await SupportRepository.updateStatus(id, status);
  }

  static async reply(id: number, payload: unknown, actor: Actor) {
    if (!Number.isFinite(id)) {
      throw new ErrBadRequest("Invalid ticket id");
    }
    const { message } = Validation.validate(replySchema, payload);
    return await SupportRepository.addReply(id, {
      message,
      sender_role: "admin",
      sender_id: actor.user_id ?? null,
      sender_name: actor.name ?? "Admin",
    });
  }

  static async listForUser(userId: string, payload: ListTicketsParams) {
    return await SupportRepository.listForUser(userId, payload);
  }

  static async detailForUser(id: number, userId: string) {
    if (!Number.isFinite(id)) {
      throw new ErrBadRequest("Invalid ticket id");
    }
    return await SupportRepository.getByIdForUser(id, userId);
  }

  static async createForUser(payload: unknown, actor: UserActor) {
    const { subject, category, message } = Validation.validate(createTicketSchema, payload);
    return await SupportRepository.createForUser({
      user_id: actor.user_id,
      requester_name: actor.name ?? null,
      requester_email: actor.email ?? null,
      subject,
      category: category ?? "general",
      message,
    });
  }

  static async replyForUser(id: number, payload: unknown, actor: UserActor) {
    if (!Number.isFinite(id)) {
      throw new ErrBadRequest("Invalid ticket id");
    }
    const { message } = Validation.validate(replySchema, payload);
    return await SupportRepository.addReplyForUser(id, actor.user_id, {
      message,
      sender_role: "user",
      sender_id: actor.user_id,
      sender_name: actor.name ?? "User",
    });
  }
}
