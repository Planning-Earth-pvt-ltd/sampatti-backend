import "dotenv/config";
import cookieParser from "cookie-parser";
import express, { Request, Response } from "express";
import cors from "cors";
import userRoute from "./routes/user.route";
import prisma from "./prisma";
import propertyRoutes from './routes/propertyRoutes';
import sellerRoutes from './routes/seller.route';
import { errorHandlerMiddleware } from './middlewares/upload';
import client from "prom-client";

const app = express();

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

app.use(cookieParser());
app.use(cors({ origin: "*" }));

app.use('/uploads', express.static('uploads'));

// console logs
console.log("DB_URL", process.env.DATABASE_URL);
console.log("DIRECT_URL", process.env.DIRECT_URL);
console.log("Twilio SID", process.env.TWILIO_ACCOUNT_SID);
console.log("Twilio Service SID", process.env.TWILIO_SERVICE_SID);
console.log("Twilio Token", process.env.TWILIO_AUTH_TOKEN);

// PROMETHEUS METRICS
client.collectDefaultMetrics();

const httpRequestCounter = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status']
});

app.get('/metrics', async (req: Request, res: Response) => {
  res.set('Content-Type', client.register.contentType);
  res.end(await client.register.metrics());
});

app.use((req, res, next) => {
  res.on('finish', () => {
    httpRequestCounter.inc({
      method: req.method,
      route: req.route?.path || req.path,
      status: res.statusCode
    });
  });
  next();
});

// health check
app.get("/", (req: Request, res: Response) => {
  res.send("Backend working");
});

// routes
app.use("/api/v1/user", userRoute);
app.use('/api/v1/property', propertyRoutes);
app.use('/api/v1/seller', sellerRoutes);

// error middleware
app.use(errorHandlerMiddleware);

// start server
async function startServer(): Promise<void> {
  try {
    const PORT = process.env.PORT || 5000;

    await prisma.$connect();
    console.log("Database Connected");

    app.listen(PORT, () => {
      console.log(`Server is running on ${PORT}`);
    });

  } catch (error) {
    console.log("error", error);
  }
};

startServer();
