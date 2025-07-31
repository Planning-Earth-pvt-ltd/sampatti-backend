import "dotenv/config";
import cookieParser from "cookie-parser";
import express, { Request, Response } from "express";
import cors from "cors";

// Routes & Middleware
import userRoute from "./routes/user.route";
import prisma from "./prisma";
import propertyRoutes from './routes/propertyRoutes';
import u_DetailsRoutes from './routes/u_Details.routes'; 
import { errorHandlerMiddleware } from './middlewares/upload';
import cartRoutes from './routes/cartRoutes';
import transactionRoutes from './routes/transactionRoutes';
import ownerRoutes from './routes/ownerUser.route';
import progressRoute from './routes/progress.route';

// Prometheus
import client from "prom-client";

const app = express();
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());
app.use(cors({ origin: "*" }));
app.use('/uploads', express.static('uploads'));

// Debug: Print env values
console.log("DB_URL", process.env.DATABASE_URL);
console.log("DIRECT_URL", process.env.DIRECT_URL);
console.log("Twilio SID", process.env.TWILIO_ACCOUNT_SID);
console.log("Twilio SERVICE SID", process.env.TWILIO_SERVICE_SID);
console.log("Twilio AUTH TOKEN", process.env.TWILIO_AUTH_TOKEN);

// Prometheus Registry Setup
const register = new client.Registry();
client.collectDefaultMetrics({ register, prefix: 'sampatti_' });

// Counter: Total API requests
const apiRequestCounter = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status'],
  registers: [register],
});
// Counter: Token purchases

const tokenPurchaseCounter = new client.Counter({
  name: 'app_token_purchases_total', // Prometheus metric name
  help: 'Total number of tokens purchased by all users', // Description
  labelNames: ['property_id'], // Optional: label lets you see which property was purchased
  registers: [register], // Register it so /metrics exposes it
});

// Histogram: API latency in seconds
const responseTimeHistogram = new client.Histogram({
  name: 'http_response_time_seconds',
  help: 'API response time in seconds',
  labelNames: ['method', 'route'],
  buckets: [0.005, 0.01, 0.05, 0.1, 0.3, 0.5, 1, 2, 5], // suitable buckets
  registers: [register],
});

// Counter: Logins
const loginCounter = new client.Counter({
  name: 'app_user_logins_total',
  help: 'Total number of user logins',
  registers: [register],
});

// Counter: Signups
const signupCounter = new client.Counter({
  name: 'app_user_signups_total',
  help: 'Total number of user signups',
  registers: [register],
});

// Metrics Middleware: Track traffic & latency
app.use((req, res, next) => {
  const end = responseTimeHistogram.startTimer({ method: req.method, route: req.path });

  res.on("finish", () => {
    apiRequestCounter.inc({
      method: req.method,
      route: req.path,
      status: res.statusCode,
    });

    end(); // Stop timer and record duration
  });

  next();
});

// Expose Prometheus Metrics
app.get("/metrics", async (_req, res) => {
  try {
    res.setHeader("Content-Type", register.contentType);
    res.end(await register.metrics());
  } catch (err: any) {
    res.status(500).end(err.message);
  }
});

// Health check
app.get("/", (req: Request, res: Response) => {
  res.send("Backend working");
});

// Dummy login and signup to test metrics
app.post("/login", (req ,res) => {
  loginCounter.inc();
  res.send("Login counted");
});

app.post("/signup", (req ,res) => {
  signupCounter.inc();
  res.send("Signup counted");
});


app.post("/token/purchase", (req: Request, res: Response) => {
  const { propertyId } = req.body;

  if (!propertyId) {
    return res.status(400).json({ message: "Property ID required" });
  }

  // 🔥 Step 5: Increment metric — this is what Prometheus will track
  tokenPurchaseCounter.inc({ property_id: propertyId });

  res.status(200).json({ message: `Token purchase recorded for property ${propertyId}` });
});

// Actual application routes
app.use("/api/v1/user", userRoute);
app.use('/api/v1/u_Details', u_DetailsRoutes);
app.use('/api/v1/property', propertyRoutes);
app.use('/api/v1/carts', cartRoutes);
app.use('/api/v1/transactions', transactionRoutes);
app.use('/api/v1/ownerUser', ownerRoutes);
app.use('/api/v1/progress', progressRoute);
app.use(errorHandlerMiddleware);

// Start server
async function startServer(): Promise<void> {
  try {
    const PORT = process.env.PORT || 4000;
    await prisma.$connect();
    console.log("Database Connected");

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.log("Server start error:", error);
  }
};

startServer();
