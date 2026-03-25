const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

const userRoutes = require("./routes/userRoutes");

app.get("/", (req, res) => {
  res.send("Server is running");
});

app.use("/api/users", userRoutes);
const resortRoutes = require("./routes/resortRoutes");

app.use("/api/resorts", resortRoutes);

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});