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
exports.ChannelService = void 0;
const mongoose_1 = require("mongoose");
class ChannelService {
    constructor(channelRepository, userRepository) {
        this.channelRepository = channelRepository;
        this.userRepository = userRepository;
    }
    createChannel(channelData) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log(channelData, "channel data got in the reocmesubscription service channel creation");
                console.log(channelData.email, "channel data email");
                if (!channelData.email) {
                    throw new Error("Email is required");
                }
                try {
                    const existingChannel = yield this.channelRepository.findByEmail(channelData.email);
                    if (existingChannel) {
                        throw new Error("Channel with this email already exists");
                    }
                }
                catch (error) {
                    if (!(error instanceof Error) || !error.message.includes("not found")) {
                        throw error;
                    }
                }
                const user = yield this.userRepository.findByEmail(channelData.email);
                if (!user) {
                    throw new Error("User not found");
                }
                const newData = Object.assign(Object.assign({}, channelData), { ownerId: new mongoose_1.Types.ObjectId(user._id.toString()) });
                return yield this.channelRepository.create(newData);
            }
            catch (error) {
                console.error("Error in createChannel:", error);
                throw error;
            }
        });
    }
    editChannel(channelId, updateData) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.channelRepository.update(channelId, updateData);
        });
    }
    deleteChannel(channelId) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.channelRepository.delete(channelId);
        });
    }
    getChannelByEmail(email) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.channelRepository.findByEmails(email);
        });
    }
}
exports.ChannelService = ChannelService;
