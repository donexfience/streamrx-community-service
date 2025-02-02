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
exports.ChannelRepostiory = void 0;
const channel_1 = __importDefault(require("../modals/schema/channel"));
class ChannelRepostiory {
    create(channelData) {
        return __awaiter(this, void 0, void 0, function* () {
            const channel = new channel_1.default(channelData);
            console.log(channel, "data in the repository not saving");
            return yield channel.save();
        });
    }
    update(channelId, updateData) {
        return __awaiter(this, void 0, void 0, function* () {
            const channel = yield channel_1.default.findByIdAndUpdate(channelId, updateData, {
                new: true,
            });
            if (!channel) {
                throw new Error(`Channel with ID ${channelId} not found`);
            }
            return channel;
        });
    }
    delete(channelId) {
        return __awaiter(this, void 0, void 0, function* () {
            yield channel_1.default.findByIdAndDelete(channelId);
        });
    }
    findById(channelId) {
        return __awaiter(this, void 0, void 0, function* () {
            const channel = yield channel_1.default.findById(channelId);
            if (!channel) {
                throw new Error(`Channel with ID ${channelId} not found`);
            }
            return channel;
        });
    }
    findByEmails(email) {
        return __awaiter(this, void 0, void 0, function* () {
            const channel = yield channel_1.default.findOne()
                .populate({
                path: "ownerId",
                match: { email: email },
                select: "email",
            })
                .exec();
            if (!channel || !channel.ownerId) {
                throw new Error(`Channel with owner email ${email} not found`);
            }
            return channel;
        });
    }
    findByEmail(email) {
        return __awaiter(this, void 0, void 0, function* () {
            const channel = yield channel_1.default.findOne({ email })
                .populate({ path: "ownerId", select: "email" })
                .exec();
            if (!channel) {
                throw new Error(`Channel with email ${email} not found`);
            }
            return channel;
        });
    }
}
exports.ChannelRepostiory = ChannelRepostiory;
