import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import http from "http";
import { initSocket } from "./services/socketService.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import componentRoutes from "./routes/componentRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import eventRoutes from "./routes/eventRoutes.js";
import externalEventRoutes from "./routes/externalEventRoutes.js";
import newsRoutes from "./routes/newsRoutes.js";
import problemRoutes from "./routes/problemRoutes.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { initCronJobs } from "./services/cronService.js";
import { fetchAndStoreNews } from "./services/newsService.js";

dotenv.config();

const app = express();
const server = http.createServer(app);

initSocket(server);
initCronJobs();

// Fetch news immediately once on startup to seed
fetchAndStoreNews();

app.use(cors());
app.use(express.json());

app.use("/api/payment", paymentRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/users", userRoutes);
app.use("/api/components", componentRoutes);
app.use("/api/chats", chatRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/external-events", externalEventRoutes);
app.use("/api/news", newsRoutes);
app.use("/api/problems", problemRoutes);

app.get("/", (req, res) => {
    res.send("🚀 MakerMarT Backend Running");
});

// Centralized Error Handler (must be after routes)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});