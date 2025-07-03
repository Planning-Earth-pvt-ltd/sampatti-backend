import "dotenv/config";
import cookieParser from "cookie-parser";
import express, { Request, Response } from "express";
import cors from "cors";
import userRoute from "./routes/user.route";
import prisma from "./prisma";
import propertyRoutes from './routes/propertyRoutes'; 
import { errorHandlerMiddleware } from './middlewares/upload';

const app = express();

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());
app.use(cors({ origin: "*" }));

app.use('/uploads', express.static('uploads'));

app.get("/", (req: Request, res: Response) => {
  res.send("Backend working");
});

app.use("/api/v1/user", userRoute);

app.use('/api/v1/property', propertyRoutes);
app.use(errorHandlerMiddleware);

prisma.$connect();
console.log("Database Connected");


const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`);
});
