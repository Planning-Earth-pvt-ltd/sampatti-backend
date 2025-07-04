import "dotenv/config";
import cookieParser from "cookie-parser";
import express, { Request, Response } from "express";
import cors from "cors";
import userRoute from "./routes/user.route";
import prisma from "./prisma";
<<<<<<< HEAD
import propertyRoutes from './routes/propertyRoutes'; 
import { errorHandlerMiddleware } from './middlewares/upload';

const app = express();

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
=======
//import propertyRoutes from './routes/propertyRoutes';

// dotenv.config();

const app = express();

console.log("DB_URL",process.env.DATABASE_URL);
console.log("DB_URL",process.env.DIRECT_URL);
console.log("Twilio SID",process.env.TWILIO_ACCOUNT_SID);
console.log("Twilio SID",process.env.TWILIO_SERVICE_SID);
console.log("Twilio SID",process.env.TWILIO_AUTH_TOKEN);




app.use(express.json());
>>>>>>> 61733efe84116e7f1fbbf6403b8662fd68997cb4
app.use(cookieParser());
app.use(cors({ origin: "*" }));

app.use('/uploads', express.static('uploads'));

app.get("/", (req: Request, res: Response) => {
  res.send("Backend working");
});

app.use("/api/v1/user", userRoute);
<<<<<<< HEAD

app.use('/api/v1/property', propertyRoutes);
app.use(errorHandlerMiddleware);

prisma.$connect();
console.log("Database Connected");


const PORT = process.env.PORT || 3000;
=======
//app.use('/api/v1/property', propertyRoutes);

// Server and database starting
async function startServer(): Promise<void>  {
    try {
      const PORT = process.env.PORT || 5000;

   await prisma.$connect();
   console.log("Database Connected");
>>>>>>> 61733efe84116e7f1fbbf6403b8662fd68997cb4

   app.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`);
});

  } catch (error) {
    console.log("error" , error);
  }
};

startServer();



