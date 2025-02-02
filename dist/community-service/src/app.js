"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const userRepository_1 = require("./repository/userRepository");
const userService_1 = require("./services/userService");
const channelRepository_1 = require("./repository/channelRepository");
const channelService_1 = require("./services/channelService");
const communitySubscriptionConsumer_1 = require("./communications/communitySubscriptionConsumer");
const channelSubscriptionService_1 = require("./services/channelSubscriptionService");
const channelSubscription_1 = require("./repository/channelSubscription");
const morgan_1 = __importDefault(require("morgan"));
const connection_1 = require("./config/connection");
class App {
    constructor(port) {
        this.app = (0, express_1.default)();
        this.port = port;
        this.initializeMiddleware();
        this.initializeServices();
        this.startConsuming();
    }
    initializeMiddleware() {
        this.app.use((0, cors_1.default)({
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
        }));
        this.app.use((0, morgan_1.default)("tiny"));
        this.app.use(express_1.default.json());
        this.app.use(express_1.default.urlencoded({ extended: true }));
        // this.app.use("/", commonRouter);
        // this.app.use(ErrorMiddleware.handleError);
    }
    initializeServices() {
        return __awaiter(this, void 0, void 0, function* () {
            yield connection_1.Database.connect();
        });
    }
    listen() {
        this.app.listen(this.port, () => {
            console.log(`CHANNEL-SERVICE RUNNING ON PORT  ${this.port}`);
        });
    }
    startConsuming() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user_repostiory = new userRepository_1.UserRepository();
                const userService = new userService_1.UserService(user_repostiory);
                const channelRepository = new channelRepository_1.ChannelRepostiory();
                const channelService = new channelService_1.ChannelService(channelRepository, user_repostiory);
                const channelSubscriptionRepository = new channelSubscription_1.ChannelSubscriptionRepository();
                const channelSubscriptionService = new channelSubscriptionService_1.ChannelSubscriptionService(channelSubscriptionRepository, channelRepository);
                const channelServiceConsumer = new communitySubscriptionConsumer_1.CommunityServiceConsumer(userService, channelService, channelSubscriptionService);
                yield channelServiceConsumer.start();
                console.log("[INFO] Started consuming messages from RabbitMQ queues.");
            }
            catch (error) {
                console.error("[ERROR] Failed to start consuming:", error);
            }
        });
    }
}
exports.default = App;
