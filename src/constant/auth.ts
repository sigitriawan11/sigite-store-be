export const CONFIG_COOKIES_ACCESS_TOKEN : Record<string, string | boolean | number> = {
  httpOnly: true,
  secure: true,
  sameSite: "lax",
  maxAge: 1000 * 60 * 60 * 24,
}

export const CONFIG_COOKIES_REFRESH_TOKEN : Record<string, string | boolean | number> = {
  httpOnly: true,
  secure: true,
  sameSite: "lax",
  maxAge: 1000 * 60 * 60 * 24 * 3,
}