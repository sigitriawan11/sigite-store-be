import { AdminReportRepository } from "../repositories/admin-reports";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function toDateStr(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export class AdminReportService {
  static async getReport(params: { date_from?: string; date_to?: string }) {
    const today = new Date();
    const defaultFrom = new Date();
    defaultFrom.setDate(today.getDate() - 29);

    const date_to = DATE_RE.test(params.date_to || "")
      ? (params.date_to as string)
      : toDateStr(today);
    const date_from = DATE_RE.test(params.date_from || "")
      ? (params.date_from as string)
      : toDateStr(defaultFrom);

    return await AdminReportRepository.getReport({ date_from, date_to });
  }
}
