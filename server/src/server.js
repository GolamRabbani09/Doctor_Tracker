const path = require("path");
const dotenv = require("dotenv");

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const express = require("express");
const cors = require("cors");

const morgan = require("morgan");
let rateLimit;
try {
  rateLimit = require("express-rate-limit");
} catch (e) {
  // Built-in token-bucket rate limiter fallback
  rateLimit = (options = {}) => {
    const windowMs = options.windowMs || 15 * 60 * 1000;
    const max = options.max || 100;
    const requests = new Map();
    return (req, res, next) => {
      const ip = req.ip || req.socket.remoteAddress || "anonymous";
      const now = Date.now();
      const record = requests.get(ip) || {
        count: 0,
        resetTime: now + windowMs,
      };
      if (now > record.resetTime) {
        record.count = 1;
        record.resetTime = now + windowMs;
      } else {
        record.count += 1;
      }
      requests.set(ip, record);
      if (record.count > max) {
        return res
          .status(429)
          .json(
            options.message || {
              success: false,
              error:
                "Too many requests from this IP, please try again after 15 minutes.",
            },
          );
      }
      next();
    };
  };
}

const connectDB = require("./config/db");
const { errorHandler, ApiError } = require("./middleware/errorHandler");

// Route imports
const authRoutes = require("./routes/authRoutes");
const doctorRoutes = require("./routes/doctorRoutes");
const patientRoutes = require("./routes/patientRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");

const app = express();

// Enable CORS with dynamic origin support
const allowedOrigins = [
  process.env.CLIENT_URL || "https://doctor-tracker-snowy-two.vercel.app",
  "http://localhost:3000",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (such as mobile apps, curl, Postman)
      if (!origin) return callback(null, true);
      if (
        allowedOrigins.indexOf(origin) !== -1 ||
        process.env.NODE_ENV !== "production"
      ) {
        return callback(null, true);
      }
      return callback(new ApiError("Not allowed by CORS", 403));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// HTTP request logging in development
if (process.env.NODE_ENV !== "test") {
  app.use(morgan("dev"));
}

// Global API Rate Limiter: 100 requests per 15 minutes
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: "Too many requests from this IP, please try again after 15 minutes.",
  },
});

// Apply rate limiter to /api/ routes (except health check if needed)
app.use("/api", apiLimiter);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/api/patients", patientRoutes);
app.use("/api/analytics", analyticsRoutes);

// Catch 404 and forward to error handler
app.use((req, res, next) => {
  next(
    new ApiError(`Endpoint not found: ${req.method} ${req.originalUrl}`, 404),
  );
});

// Centralized error handler middleware
app.use(errorHandler);

const PORT = parseInt(process.env.PORT, 10) || 5000;

let server;

/**
 * Start the Express HTTP server after establishing MongoDB connection
 */
const startServer = async () => {
  try {
    await connectDB();
    server = app.listen(PORT, () => {
      console.log(
        `[Server] Doctor Tracker backend running in ${process.env.NODE_ENV || "development"} mode on port ${PORT}`,
      );
      console.log(`[Server] Health check: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error(`[Server] Failed to start server: ${error.message}`);
    process.exit(1);
  }
};

// Graceful shutdown handling
const handleShutdown = (signal) => {
  console.log(`[Server] Received ${signal}. Commencing graceful shutdown...`);
  if (server) {
    server.close(async () => {
      console.log("[Server] HTTP server closed.");
      try {
        const mongoose = require("mongoose");
        await mongoose.connection.close(false);
        console.log("[MongoDB] Connection closed.");
        process.exit(0);
      } catch (err) {
        console.error("[MongoDB] Error during connection close:", err);
        process.exit(1);
      }
    });
  } else {
    process.exit(0);
  }
};

process.on("SIGTERM", () => handleShutdown("SIGTERM"));
process.on("SIGINT", () => handleShutdown("SIGINT"));

// Start server when executed directly
if (require.main === module) {
  startServer();
}

module.exports = { app, startServer };
