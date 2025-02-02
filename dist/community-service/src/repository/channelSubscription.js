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
exports.ChannelSubscriptionRepository = void 0;
const subscription_1 = __importDefault(require("../models/schemas/subscription"));
class ChannelSubscriptionRepository {
    subscribe(userId, channelId) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("callling the subscribe for activation");
            return yield subscription_1.default.findOneAndUpdate({ userId, channelId }, { status: "active" }, { upsert: true, new: true });
        });
    }
    unsubscribe(userId, channelId) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("callling the subscribe for activation");
            const result = yield subscription_1.default.findOneAndUpdate({ userId, channelId }, { status: "cancelled" }, { new: true });
            if (!result) {
                throw new Error("Subscription not found");
            }
            return result;
        });
    }
    getSubscriptionStatus(userId, channelId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const channelSubscription = yield subscription_1.default.findOne({
                    userId,
                    channelId,
                }).sort({ updatedAt: -1 });
                console.log({
                    foundSubscription: !!channelSubscription,
                    status: channelSubscription === null || channelSubscription === void 0 ? void 0 : channelSubscription.status,
                    isActive: (channelSubscription === null || channelSubscription === void 0 ? void 0 : channelSubscription.status) === "active",
                });
                return (channelSubscription === null || channelSubscription === void 0 ? void 0 : channelSubscription.status) === "active" || false;
            }
            catch (error) {
                console.error("Error checking subscription status:", error);
                return false;
            }
        });
    }
    getSubscriberCount(channelId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield subscription_1.default.countDocuments({
                channelId,
                status: "active",
            });
        });
    }
    getSubscriptions(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield subscription_1.default.find({
                userId,
                status: "active",
            }).populate("channelId");
        });
    }
}
exports.ChannelSubscriptionRepository = ChannelSubscriptionRepository;
