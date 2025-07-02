import "dotenv/config";
import cookieParser from "cookie-parser";
import express, { Request, Response } from "express";
import cors from "cors";
import userRoute from "./routes/user.route";
import prisma from "./prisma";
import propertyRoutes from './routes/propertyRoutes';

// dotenv.config();

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: "*" }));

app.get("/", (req: Request, res: Response) => {
  res.send("Backend working");
});

// Middleware
app.use("/api/v1/user", userRoute);
app.use('/api/v1/property', propertyRoutes);

// Server and database starting
async function startServer(): Promise<void>  {
    try {
      const PORT = process.env.PORT || 5000;

   await prisma.$connect();
   console.log("Database Connected");

   app.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`);
});

  } catch (error) {
    console.log("error");
  }
};

startServer();



