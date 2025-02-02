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
        this.app.use(morgan("tiny"));
        this.app.use(express_1.default.json());
        this.app.use(express_1.default.urlencoded({ extended: true }));
        this.app.use("/", commonRouter);
        // this.app.use(ErrorMiddleware.handleError);
    }
    initializeServices() {
        return __awaiter(this, void 0, void 0, function* () {
            yield Database.connect();
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
                const user_repostiory = new UserRepository();
                const userService = new UserService(user_repostiory);
                const channelRepository = new ChannelRepostiory();
                const channelService = new ChannelService(channelRepository, user_repostiory);
                const channelServiceConsumer = new SubscriptionServiceConsumer(userService, channelService, videoService, playlistService);
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
