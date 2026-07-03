import { AdminDashboardRepository } from "../repositories/admin-dashboard";

export class AdminDashboardService {
  static async getSummary() {
    return await AdminDashboardRepository.getSummary();
  }
}
