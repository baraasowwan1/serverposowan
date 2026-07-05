import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import { connectDB } from "./config/db";

// ==================== Environment Debug ====================
console.log("==========================================");
console.log("🚀 Server Starting...");
console.log("NODE_ENV:", process.env.NODE_ENV);
console.log("PORT:", process.env.PORT);
console.log("FRONTEND_URL:", process.env.FRONTEND_URL);
console.log("MONGODB_URI Exists:", !!process.env.MONGODB_URI);

if (process.env.MONGODB_URI) {
  console.log(
    "Mongo URI:",
    process.env.MONGODB_URI.substring(0, 35) + "..."
  );
} else {
  console.log("❌ MONGODB_URI = undefined");
}

console.log(
  "Environment Keys:",
  Object.keys(process.env).filter(
    (k) =>
      k.includes("MONGO") ||
      k.includes("JWT") ||
      k.includes("PORT") ||
      k.includes("NODE")
  )
);
console.log("==========================================");
// ===========================================================

const app = express();

// الاتصال بقاعدة البيانات
connectDB();

// ─── Security ───────────────────────────────────────────────
app.use(helmet());

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "*",
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: {
    success: false,
    message: "محاولات كثيرة، حاول لاحقاً",
  },
});

app.use("/api/", globalLimiter);
app.use("/api/auth/login", authLimiter);

// ─── Parsers ────────────────────────────────────────────────
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.use("/uploads", express.static("uploads"));

// ─── Routes ─────────────────────────────────────────────────
app.use("/api/auth", require("./routes/auth"));
app.use("/api/users", require("./routes/users"));
app.use("/api/products", require("./routes/products"));
app.use("/api/customers", require("./routes/customers"));
app.use("/api/suppliers", require("./routes/suppliers"));
app.use("/api/sales", require("./routes/sales"));
app.use("/api/purchases", require("./routes/purchases"));
app.use("/api/expenses", require("./routes/expenses"));
app.use("/api/inventory", require("./routes/inventory"));
app.use("/api/dashboard", require("./routes/dashboard"));
app.use("/api/reports", require("./routes/reports"));
app.use("/api/settings", require("./routes/settings"));
app.use("/api/platform", require("./routes/platform"));

// ─── Health ─────────────────────────────────────────────────
app.get("/", (_req, res) => {
  res.json({
    status: "✅ POS Supermarket API Running",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
  });
});

// 404
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: "المسار غير موجود",
  });
});

// Error Handler
app.use(
  (
    err: any,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    console.error(err);

    res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || "خطأ في الخادم",
      ...(process.env.NODE_ENV === "development" && {
        stack: err.stack,
      }),
    });
  }
);

const PORT = Number(process.env.PORT) || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

export default app;
