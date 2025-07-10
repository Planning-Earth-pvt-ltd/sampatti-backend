import "dotenv/config";
import cookieParser from "cookie-parser";
import express, { Request, Response } from "express";
import cors from "cors";
import userRoute from "./routes/user.route";
import prisma from "./prisma";
<<<<<<< HEAD
import propertyRoutes from './routes/propertyRoutes';
import sellerRoutes from './routes/seller.route';
=======
import propertyRoutes from './routes/propertyRoutes'; 
import u_DetailsRoutes from './routes/u_Details.routes'; 
>>>>>>> 3dc436e (8 routes all working also twilio added)
import { errorHandlerMiddleware } from './middlewares/upload';


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
<<<<<<< HEAD
=======
app.use('/api/v1/u_Details', u_DetailsRoutes);
>>>>>>> 3dc436e (8 routes all working also twilio added)
app.use('/api/v1/property', propertyRoutes);
app.use('/api/v1/seller', sellerRoutes);
app.use(errorHandlerMiddleware);

async function startServer(): Promise<void>  {
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



