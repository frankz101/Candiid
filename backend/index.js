const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

// const UserRoutes = require("./routes/UserRoutes.js");

// app.use("/user", UserRoutes);

app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}`);
});
