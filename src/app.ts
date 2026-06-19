import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import { logger } from "./middlerware/logger";
import { errorMiddleware } from "./middlerware/error-middleware";
import router from "./routes";
import passport from "./config/passport";
import cookieParser from "cookie-parser";
import path from "path";
import { startSyncProductDigiflazzCron } from "./jobs/digiflazzCron";
import { checkExpiredTransactions } from "./jobs/expiredCron";
import cron from "node-cron";
const app = express();

app.use(cors({
  origin: process.env.ALLOWED_CORS?.split(','),
  credentials: true
}));
app.use(cookieParser());
app.use(express.json());
app.use(logger)
app.set("trust proxy", true);

app.use(passport.initialize());

app.use(
  "/images",
  express.static(path.join(process.cwd(), "public/images"), {
    maxAge: '7d'
  })
);
app.use(
  "/icons",
  express.static(path.join(process.cwd(), "public/icons"), {
    maxAge: '7d'
  })
);

startSyncProductDigiflazzCron();


cron.schedule("* * * * *", () => {
    checkExpiredTransactions();
});

app.use('/v1/', router)

app.use(errorMiddleware)
app.all('{*splat}', (req, res) => {
  res.status(404).send({
    status: false,
    message: "Hello Operaon Here !!!"
  })
})

export default app;