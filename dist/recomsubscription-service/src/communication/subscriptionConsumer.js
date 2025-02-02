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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionServiceConsumer = void 0;
const streamrx_common_1 = require("streamrx_common");
class SubscriptionServiceConsumer {
    constructor(userService, channelService, vidoeService, playlistService) {
        this.userService = userService;
        this.channelService = channelService;
        this.videoService = vidoeService;
        this.playlistService = playlistService;
        this.rabbitMQConnection = streamrx_common_1.RabbitMQConnection.getInstance();
        this.rabbitMQConsumer = new streamrx_common_1.RabbitMQConsumer(this.rabbitMQConnection);
    }
    start() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.rabbitMQConnection.connect(process.env.RABBITMQ_URL || "amqp://localhost");
                yield this.rabbitMQConsumer.consumeFromExchange("user-updated", this.handleUserUpdatedMessage.bind(this));
                yield this.rabbitMQConsumer.consumeFromExchange("user-created", this.handleUserCreatedMessage.bind(this));
                yield this.rabbitMQConsumer.consumeFromExchange("channel-created", this.handleChannelCreatedMessage.bind(this));
                yield this.rabbitMQConsumer.consumeFromExchange("video-created", this.handleVideoCreationMessage.bind(this));
                yield this.rabbitMQConsumer.consumeFromExchange("playlist-created", this.handlePlaylistCreationMessage.bind(this));
                // queue based consuming
                //   await this.rabbitMQConsumer.consume(
                //     QUEUES.USER_CREATED,
                //     this.handleUserCreatedMessage.bind(this)
                //   );
                console.log("[INFO] Started consuming messages from RabbitMQ queues and exchanges.");
            }
            catch (error) {
                console.error("[ERROR] Failed to start consuming:", error);
                throw error;
            }
        });
    }
    handleUserCreatedMessage(msg) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!msg)
                return;
            try {
                const message = JSON.parse(msg.content.toString());
                console.log("[INFO] User Created message:", message);
                yield this.userService.createUser(message);
            }
            catch (error) {
                console.error("[ERROR] Failed to handle user created message:", error);
                throw error;
            }
        });
    }
    handleChannelCreatedMessage(msg) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!msg)
                return;
            try {
                const message = JSON.parse(msg.content.toString());
                console.log("[INFO] User Updated message:", message);
                yield this.channelService.createChannel(message);
            }
            catch (error) {
                console.error("[ERROR] Failed to handle user updated message:", error);
                throw error;
            }
        });
    }
    handleVideoCreationMessage(msg) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!msg)
                return;
            try {
                const message = JSON.parse(msg.content.toString());
                console.log("[INFO] User Updated message:", message, "message id for channel", message._id);
                yield this.videoService.createVideoRecord(message, message.channelId);
            }
            catch (error) {
                console.error("[ERROR] Failed to handle user updated message:", error);
                throw error;
            }
        });
    }
    handlePlaylistCreationMessage(msg) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!msg)
                return;
            try {
                const message = JSON.parse(msg.content.toString());
                console.log("[INFO] User Updated message:", message);
                yield this.playlistService.createPlaylist(message);
            }
            catch (error) {
                console.error("[ERROR] Failed to handle user updated message:", error);
                throw error;
            }
        });
    }
    handleUserUpdatedMessage(msg) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!msg)
                return;
            try {
                const message = JSON.parse(msg.content.toString());
                console.log("[INFO] User Updated message:", message);
                yield this.userService.updateUserById(message.id, message);
            }
            catch (error) {
                console.error("[ERROR] Failed to handle user updated message:", error);
                throw error;
            }
        });
    }
}
exports.SubscriptionServiceConsumer = SubscriptionServiceConsumer;
