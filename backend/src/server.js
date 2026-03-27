const express = require("express");
const dotenv = require("dotenv");
const path = require("path");
const cors = require("cors");

// ✅ โหลด .env ก่อนทุกอย่าง
dotenv.config({ path: path.join(__dirname, "../.env") });

const connectDB = require("./config/db");
const routes = require("./routes/index");

connectDB();

const app = express();

app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
}));

app.use(express.json());
app.use("/api", routes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
);