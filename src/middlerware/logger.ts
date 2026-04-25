import morgan from "morgan";

export const logger = morgan((tokens, req, res) => {
  const method = tokens.method?.(req, res) ?? "-";
  const url = tokens.url?.(req, res) ?? "-";
  const status = tokens.status?.(req, res) ?? "-";
  const time = tokens["response-time"]?.(req, res) ?? "-";

  return `${method} ${url} ${status} ${time} ms`;
});