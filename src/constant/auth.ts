const isProduction = process.env.NODE_ENV === "production";

export const CONFIG_COOKIES_ACCESS_TOKEN : Record<string, string | boolean | number> = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? "strict" : "lax",
  maxAge: 1000 * 60 * 60 * 24,
}

export const CONFIG_COOKIES_REFRESH_TOKEN : Record<string, string | boolean | number> = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? "strict" : "lax",
  maxAge: 1000 * 60 * 60 * 24 * 3,
}
