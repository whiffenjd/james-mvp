import express, { NextFunction, Request, Response } from "express";
import helmet from "helmet";
import dotenv from "dotenv";
import cors from "cors";
import investorRouter from "./Routes/InvestorRoutes";
import authRouter from "./Routes/AuthRoutes";
import { xssSanitizer } from "./Services/XssSanitizer";

dotenv.config();
export const app = express();
const PORT = process.env.PORT || 5000;

// Middleware order is important
app.use(cors());

// Parse JSON and URL-encoded bodies before applying security middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Apply security middlewares after body parsing
app.use(helmet()); // Sets secure HTTP headers

// Alternative to xss-clean
// Apply our custom XSS sanitizer middleware
app.use(xssSanitizer);

// Routes
app.use("/auth/investor", investorRouter);
app.use("/auth/user", authRouter);

app.get("/", (req: Request, res: Response) => {
  res.send("Hello World!");
});

// Error handling middleware - should be last
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
