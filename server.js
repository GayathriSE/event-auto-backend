import express, { json } from "express";
import bodyParser from "body-parser";
import { eventsRouter } from "./routes/index.js";
import cors from "cors";
import { errorMiddleware } from "./utils/utils.js";

const app = express();
app.use(cors());
const port = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: false, limit: "3mb" }));
app.use(json({ limit: "3mb" }));
app.use(errorMiddleware);

app.use("/api", eventsRouter);

app.get("/", (req, res) => {
  console.log("Welcome");
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
