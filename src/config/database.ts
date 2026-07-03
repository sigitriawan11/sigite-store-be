export const dbConfig = {
  main: {
    // Managed providers (Neon/Supabase) give a single connection string.
    // When DATABASE_URL is set it takes precedence over the discrete fields below.
    url: process.env.DATABASE_URL,
    database: process.env.DB_NAME!,
    username: process.env.DB_USER!,
    password: process.env.DB_PASS!,
    host: process.env.DB_HOST!,
    port: Number(process.env.DB_PORT!),
    dialect: "postgres",
    // Managed Postgres requires SSL. Enable with DB_SSL=true.
    ssl: process.env.DB_SSL === "true",
  },
};