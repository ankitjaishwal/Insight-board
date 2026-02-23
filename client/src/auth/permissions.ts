export type Role = "ADMIN" | "OPS" | "FINANCE" | "USER";

export const permissions = {
  audit: ["ADMIN"],
  transactions: ["ADMIN", "OPS", "FINANCE"],
  overview: ["ADMIN", "OPS", "FINANCE", "USER"],
};
