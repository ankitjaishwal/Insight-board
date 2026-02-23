import express from "express";
import cors from "cors";
import auditRoutes from "./routes/audit.router";
import transactionRoutes from "./routes/transaction.routes";
import overviewRoutes from "./routes/overview.route";
import authRoutes from "./routes/auth.router";

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/audit-logs", auditRoutes);
app.use("/api/overview", overviewRoutes);

app.listen(4000, () => {
  console.log("API running on http://localhost:4000");
});
