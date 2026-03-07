import express from "express";
import cors from "cors";
import auditRoutes from "./routes/auditLogs.router";
import transactionRoutes from "./routes/transaction.routes";
import overviewRoutes from "./routes/overview.route";
import authRoutes from "./routes/auth.router";
import presetsRoutes from "./routes/presets.routes";
import adminRoutes from "./routes/admin.routes";
import { ensureDemoUser } from "./bootstrap/ensureDemoUser";
import { errorHandler } from "./middleware/errorHandler";
import { apiLimiter } from "./middleware/rateLimiter";
import { securityHeaders } from "./middleware/securityHeaders";

const app = express();

app.use(securityHeaders);
app.use(cors());
app.use(express.json());
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
      console.log("API running on http://localhost:4000");
    });
  })
  .catch((error) => {
    console.error("Failed to bootstrap demo account", error);
    process.exit(1);
  });
