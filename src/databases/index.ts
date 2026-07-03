import { Sequelize, Options } from "sequelize";
import { dbConfig } from "../config/database";

class DatabaseManager {
  private static instances: Record<string, Sequelize> = {};

  static getDB(name: keyof typeof dbConfig): Sequelize {
    if (!this.instances[name]) {
      const config = dbConfig[name];

      const options: Options = {
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
      };

      // Managed Postgres (Neon/Supabase) requires SSL.
      if (config.ssl) {
        options.dialectOptions = {
          ssl: { require: true, rejectUnauthorized: false },
        };
      }

      // Prefer a single connection string when provided (DATABASE_URL).
      this.instances[name] = config.url
        ? new Sequelize(config.url, options)
        : new Sequelize(config.database, config.username, config.password, options);
    }

    return this.instances[name];
  }
}

export default DatabaseManager;