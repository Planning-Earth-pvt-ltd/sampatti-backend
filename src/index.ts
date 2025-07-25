import "dotenv/config";
import cookieParser from "cookie-parser";
import express, { Request, Response } from "express";
import cors from "cors";
import userRoute from "./routes/user.route";
import prisma from "./prisma";
import propertyRoutes from './routes/propertyRoutes';
import u_DetailsRoutes from './routes/u_Details.routes'; 
import { errorHandlerMiddleware } from './middlewares/upload';
import cartRoutes from './routes/cartRoutes';
import transactionRoutes from './routes/transactionRoutes';
import ownerRoutes from './routes/ownerUser.route';
import progressRoute from './routes/progress.route';
import dashboard from './routes/dashboardRoute';
import adminRoutes from './routes/adminLogin.route';

const app = express();
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

console.log("DB_URL",process.env.DATABASE_URL);
console.log("DB_URL",process.env.DIRECT_URL);
console.log("Twilio SID",process.env.TWILIO_ACCOUNT_SID);
console.log("Twilio SID",process.env.TWILIO_SERVICE_SID);
console.log("Twilio SID",process.env.TWILIO_AUTH_TOKEN);


app.use(cookieParser());
app.use(cors({ origin: "*" }));

app.use('/uploads', express.static('uploads'));

app.get("/", (req: Request, res: Response) => {
  res.send("Backend working");
});

app.use("/api/v1/user", userRoute);
app.use('/api/v1/u_Details', u_DetailsRoutes);
app.use('/api/v1/property', propertyRoutes);
app.use('/api/v1/carts', cartRoutes);
app.use('/api/v1/transactions', transactionRoutes);
app.use('/api/v1/ownerUser', ownerRoutes);
app.use('/api/v1/progress', progressRoute);
app.use('/api/v1/dashboard',dashboard);
app.use('/api/v1/admin',adminRoutes);

app.use(errorHandlerMiddleware);

async function startServer(): Promise<void>  {
    try {
      const PORT = parseInt(process.env.PORT || '4000', 10);


    await prisma.$connect();
    console.log("Database Connected");

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server is running on ${PORT}`);
    });

  } catch (error) {
    console.log("error", error);
  }
};

startServer();



