import cors from "cors";
import express, { Application } from "express";
import { UserRepository } from "./repository/userRepository";
import { UserService } from "./services/userService";
import { ChannelRepostiory } from "./repository/channelRepository";
import { ChannelService } from "./services/channelService";
import { createServer, Server } from "http";
import { Server as SocketIOServer } from "socket.io";
import { CommunityServiceConsumer } from "./communications/communitySubscriptionConsumer";
import { ChannelSubscriptionService } from "./services/channelSubscriptionService";
import { ChannelSubscriptionRepository } from "./repository/channelSubscription";
import morgan from "morgan";
import { Database } from "./config/connection";
import commonRouter from "./router/commonRouter";
import { SocketService } from "./services/socketService";

class App {
  public app: Application;
  private port: number;
  private server: Server;

  private io: SocketIOServer;

  constructor(port: number) {
    this.app = express();
    this.port = port;
    this.server = createServer(this.app);
    this.io = new SocketIOServer(this.server, {
      cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:3001",
        methods: ["GET", "POST", "PUT", "PATCH", "OPTIONS"],
        credentials: true,
      },
      transports: ["websocket", "polling"],
    });

    this.initializeMiddleware();
    this.initializeServices();
    this.startConsuming();
    this.initializeSocketIO();
  }
  private initializeMiddleware() {
    this.app.use(
      cors({
        origin: ["http://localhost:3001"],
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        credentials: true,
        allowedHeaders: [
          "Origin",
          "X-Requested-With",
          "Content-Type",
          "Accept",
          "Authorization",
          "accesstoken",
          "refreshtoken",
        ],
        exposedHeaders: ["Authorization"],
      })
    );
    this.app.use(morgan("tiny"));
    this.app.use(express.json());

    this.app.use(express.urlencoded({ extended: true }));
    this.app.use("/", commonRouter);
    new SocketService(this.io);
    // this.app.use(ErrorMiddleware.handleError);
  }

  private initializeSocketIO() {
    this.io.on("connection", (socket) => {
      console.log(`Client connected: ${socket.id}`);

      socket.on("disconnect", () => {
        console.log(`Client disconnected: ${socket.id}`);
      });

      socket.onAny((eventName, ...args) => {
        console.log(`Received event "${eventName}":`, args);
      });

      socket.on("message", (data) => {
        console.log("Received message:", data);
        this.io.emit("message", data);
      });
    });
  }
  private async initializeServices() {
    await Database.connect();
  }
  public listen() {
    this.server.listen(this.port, () => {
      console.log(`CHANNEL-SERVICE RUNNING ON PORT  ${this.port}`);
    });
  }
  private async startConsuming() {
    try {
      const user_repostiory = new UserRepository();
      const userService = new UserService(user_repostiory);
      const channelRepository = new ChannelRepostiory();
      const channelService = new ChannelService(
        channelRepository,
        user_repostiory
      );
      const channelSubscriptionRepository = new ChannelSubscriptionRepository();
      const channelSubscriptionService = new ChannelSubscriptionService(
        channelSubscriptionRepository,
        channelRepository
      );

      const channelServiceConsumer = new CommunityServiceConsumer(
        userService,
        channelService,
        channelSubscriptionService
      );
      await channelServiceConsumer.start();
      console.log("[INFO] Started consuming messages from RabbitMQ queues.");
    } catch (error) {
      console.error("[ERROR] Failed to start consuming:", error);
    }
  }
}
export default App;
