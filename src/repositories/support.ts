import { Op } from "sequelize";
import { SupportTicket, SupportTicketMessage } from "../databases/main.db";
import { ErrNotFound } from "../config/errors";

interface ListTicketsParams {
  page: number;
  pageSize: number;
  search: string;
  status?: string | undefined;
}

interface ReplyPayload {
  message: string;
  sender_role: string;
  sender_id?: string | null | undefined;
  sender_name?: string | null | undefined;
}

export class SupportRepository {
  static async list(payload: ListTicketsParams) {
    const { page, pageSize, search, status } = payload;

    const where: Record<string, unknown> = {};

    if (status) {
      where.status = status;
    }

    if (search) {
      where[Op.or as any] = [
        { ticket_no: { [Op.iLike]: `%${search}%` } },
        { subject: { [Op.iLike]: `%${search}%` } },
        { requester_name: { [Op.iLike]: `%${search}%` } },
        { requester_email: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const { rows, count } = await SupportTicket.findAndCountAll({
      where,
      limit: pageSize,
      offset: (page - 1) * pageSize,
      order: [["created_at", "DESC"]],
    });

    return {
      data: rows.map((row) => row.get({ plain: true })),
      paginate: {
        page,
        pageSize,
        total: count,
      },
    };
  }

  static async getById(id: number) {
    const ticket = await SupportTicket.findByPk(id);

    if (!ticket) {
      throw new ErrNotFound("Ticket not found");
    }

    const messages = await SupportTicketMessage.findAll({
      where: { ticket_id: id },
      order: [["created_at", "ASC"]],
    });

    return {
      ...ticket.get({ plain: true }),
      messages: messages.map((m) => m.get({ plain: true })),
    };
  }

  static async updateStatus(id: number, status: string) {
    const ticket = await SupportTicket.findByPk(id);

    if (!ticket) {
      throw new ErrNotFound("Ticket not found");
    }

    await SupportTicket.update(
      { status, updated_at: new Date() },
      { where: { id } }
    );

    return this.getById(id);
  }

  static async addReply(id: number, payload: ReplyPayload) {
    const ticket = await SupportTicket.findByPk(id);

    if (!ticket) {
      throw new ErrNotFound("Ticket not found");
    }

    await SupportTicketMessage.create({
      ticket_id: id,
      sender_role: payload.sender_role,
      sender_id: payload.sender_id ?? null,
      sender_name: payload.sender_name ?? null,
      message: payload.message,
    });

    const currentStatus = ticket.get("status");
    const nextStatus =
      payload.sender_role === "admin" && currentStatus === "OPEN"
        ? "PENDING"
        : currentStatus;

    await SupportTicket.update(
      { status: nextStatus, updated_at: new Date() },
      { where: { id } }
    );

    return this.getById(id);
  }

  static async listForUser(userId: string, params: ListTicketsParams) {
    const { page, pageSize, search, status } = params;
    const where: Record<string, unknown> = { user_id: userId };
    if (status) where.status = status;
    if (search) {
      where[Op.or as any] = [
        { ticket_no: { [Op.iLike]: `%${search}%` } },
        { subject: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const { rows, count } = await SupportTicket.findAndCountAll({
      where,
      limit: pageSize,
      offset: (page - 1) * pageSize,
      order: [["created_at", "DESC"]],
    });

    return {
      data: rows.map((row) => row.get({ plain: true })),
      paginate: { page, pageSize, total: count },
    };
  }

  static async getByIdForUser(id: number, userId: string) {
    const ticket = await SupportTicket.findByPk(id);
    if (!ticket || ticket.get("user_id") !== userId) {
      throw new ErrNotFound("Ticket not found");
    }
    return this.getById(id);
  }

  static async createForUser(payload: {
    user_id: string;
    requester_name: string | null;
    requester_email: string | null;
    subject: string;
    category: string;
    message: string;
  }) {
    const [maxRow]: any = await SupportTicket.findAll({
      attributes: [[SupportTicket.sequelize!.fn("MAX", SupportTicket.sequelize!.col("id")), "max_id"]],
      raw: true,
    });
    const nextId = (Number(maxRow?.max_id) || 0) + 1;
    const ticketNo = `TIC-${String(nextId).padStart(4, "0")}`;

    const ticket = await SupportTicket.create({
      ticket_no: ticketNo,
      user_id: payload.user_id,
      requester_name: payload.requester_name,
      requester_email: payload.requester_email,
      subject: payload.subject,
      category: payload.category,
      status: "OPEN",
    });

    const ticketId = ticket.get("id") as number;

    await SupportTicketMessage.create({
      ticket_id: ticketId,
      sender_role: "user",
      sender_id: payload.user_id,
      sender_name: payload.requester_name,
      message: payload.message,
    });

    return this.getById(ticketId);
  }

  static async addReplyForUser(id: number, userId: string, payload: ReplyPayload) {
    const ticket = await SupportTicket.findByPk(id);
    if (!ticket || ticket.get("user_id") !== userId) {
      throw new ErrNotFound("Ticket not found");
    }
    return this.addReply(id, payload);
  }
}
