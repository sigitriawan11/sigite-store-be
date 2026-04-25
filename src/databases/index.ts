import { Sequelize } from "sequelize";
import { dbConfig } from "../config/database";

class DatabaseManager {
  private static instances: Record<string, Sequelize> = {};

  static getDB(name: keyof typeof dbConfig): Sequelize {
    if (!this.instances[name]) {
      const config = dbConfig[name];

      this.instances[name] = new Sequelize(
        config.database,
        config.username,
        config.password,
        {
          host: config.host,
          port: config.port,
          dialect: "postgres",
          logging: false,
          timezone: '+07:00',
          pool: {
            max: 10,
            min: 0,
            acquire: 30000,
            idle: 10000,
          },
        }
      );
    }

    return this.instances[name];
  }
}

export default DatabaseManager;