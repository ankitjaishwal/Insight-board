import express from "express";
import cors from "cors";
import auditRoutes from "./routes/auditLogs.router";
import transactionRoutes from "./routes/transaction.routes";
import overviewRoutes from "./routes/overview.route";
import authRoutes from "./routes/auth.router";
import presetsRoutes from "./routes/presets.routes";
import adminRoutes from "./routes/admin.routes";
import healthRoutes from "./routes/health.route";
import { ensureDemoUser } from "./bootstrap/ensureDemoUser";
import { errorHandler } from "./middleware/errorHandler";
import { apiLimiter } from "./middleware/rateLimiter";
import { requestLogger } from "./middleware/requestLogger";
import { securityHeaders } from "./middleware/securityHeaders";
import { logger } from "./utils/logger";

const app = express();

app.use(requestLogger);
app.use(securityHeaders);
app.use(
  cors({
    origin: "*",
    credentials: true,
  }),
);
app.use(express.json());
app.use("/health", healthRoutes);
app.use("/api", apiLimiter);
app.use("/api/auth", authRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/audit-logs", auditRoutes);
app.use("/api/overview", overviewRoutes);
app.use("/api/presets", presetsRoutes);
app.use("/api/admin", adminRoutes);
app.use(errorHandler);

ensureDemoUser()
  .then(() => {
    app.listen(4000, () => {
      logger.info("API running on http://localhost:4000");
    });
  })
  .catch((error) => {
    logger.error({ err: error }, "Failed to bootstrap demo account");
    process.exit(1);
  });
