import "dotenv/config";
import cookieParser from "cookie-parser";
import express, {Request,Response} from "express";
import cors from "cors";
import userRoute from "./routes/user.route";
import prisma from "./prisma";


const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: "*" }));


app.get("/", (req:Request,res:Response) => {
  res.send("Backend working");
});


// Middleware
app.use("/api/v1/user",userRoute);

// Database Connection
 prisma.$connect();
 console.log("Database Connected");

const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`);
});
