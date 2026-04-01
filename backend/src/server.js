const express = require("express");
const dotenv = require("dotenv");
const path = require("path");
const cors = require("cors");


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

const START_PORT = Number(process.env.PORT) || 5000;
const MAX_PORT_RETRIES = Number(process.env.MAX_PORT_RETRIES) || 10;

function startServer(port, retriesLeft) {
    const server = app.listen(port, () => {
        process.env.PORT = String(port);
        console.log(`Server running in ${process.env.NODE_ENV} mode on port ${port}`);
    });

    server.on("error", (error) => {
        if (error.code === "EADDRINUSE" && retriesLeft > 0) {
            const nextPort = port + 1;
            console.warn(`Port ${port} is in use. Retrying on port ${nextPort}...`);
            startServer(nextPort, retriesLeft - 1);
            return;
        }

        console.error("Failed to start server:", error);
        process.exit(1);
    });
}

startServer(START_PORT, MAX_PORT_RETRIES);