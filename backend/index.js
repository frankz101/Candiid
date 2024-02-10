import express from "express";
import cors from "cors";

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

import UserRoutes from "./routes/UserRoutes.js";
import HangoutRoutes from "./routes/HangoutRoutes.js";

app.use("/", UserRoutes);
app.use("/", HangoutRoutes);

app.listen(port, "0.0.0.0", () => {
  console.log(`Listening on port ${port}`);
});
