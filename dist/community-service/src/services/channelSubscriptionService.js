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
exports.ChannelSubscriptionService = void 0;
class ChannelSubscriptionService {
    constructor(repository, channelRepository) {
        this.repository = repository;
        this.channelRepository = channelRepository;
    }
    subscribe(userId, channelId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const currentStatus = yield this.repository.getSubscriptionStatus(userId, channelId);
                if (currentStatus === true) {
                    throw new Error("Already subscribed to this channel");
                }
                yield this.channelRepository.subscribe(channelId);
                return yield this.repository.subscribe(userId, channelId);
            }
            catch (error) {
                if (error instanceof Error &&
                    error.message === "Already subscribed to this channel") {
                    throw error;
                }
                throw new Error("Failed to subscribe to channel");
            }
        });
    }
    unsubscribe(userId, channelId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const currentStatus = yield this.repository.getSubscriptionStatus(userId, channelId);
                if (currentStatus === false) {
                    throw new Error("Not currently subscribed to this channel");
                }
                yield this.channelRepository.unsubscribe(channelId);
                return yield this.repository.unsubscribe(userId, channelId);
            }
            catch (error) {
                if (error instanceof Error &&
                    error.message === "Not currently subscribed to this channel") {
                    throw error;
                }
                throw new Error("Failed to unsubscribe from channel");
            }
        });
    }
    getSubscriptionStatus(userId, channelId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const subscription = yield this.repository.getSubscriptionStatus(userId, channelId);
                console.log(subscription, "status of sub");
                if (!subscription) {
                    throw new Error("Subscription not found");
                }
                return subscription;
            }
            catch (error) {
                throw new Error("Failed to get subscription status");
            }
        });
    }
    getSubscriberCount(channelId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield this.repository.getSubscriberCount(channelId);
            }
            catch (error) {
                throw new Error("Failed to get subscriber count");
            }
        });
    }
}
exports.ChannelSubscriptionService = ChannelSubscriptionService;
