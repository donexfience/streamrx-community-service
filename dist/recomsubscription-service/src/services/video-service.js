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
exports.VideoService = void 0;
const mongoose_1 = require("mongoose");
class VideoService {
    constructor(videoRepository, channelRepository) {
        this.videoRepository = videoRepository;
        this.channelRepository = channelRepository;
    }
    createVideoRecord(videoData, channelId) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(videoData, "in the service i got the video data ");
            try {
                let channel;
                if (channelId) {
                    channel = yield this.channelRepository.findById(channelId);
                }
                return yield this.videoRepository.create(Object.assign(Object.assign({}, videoData), { channelId: channel
                        ? new mongoose_1.Types.ObjectId(channel._id.toString())
                        : undefined, status: "ready" }));
            }
            catch (error) {
                throw new Error(`Failed to create video record: ${error.message}`);
            }
        });
    }
    getVideosByTitle(title) {
        return __awaiter(this, void 0, void 0, function* () {
            const filter = title ? { title: { $regex: title, $options: "i" } } : {};
            return yield this.videoRepository.findByQuery(filter);
        });
    }
    editVideo(videoId, updateData) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.videoRepository.update(videoId, updateData);
        });
    }
    getAllVideo() {
        return __awaiter(this, arguments, void 0, function* (page = 1, limit = 10) {
            const skip = (page - 1) * limit;
            return yield this.videoRepository.getAll(skip, limit);
        });
    }
    getVideoById(videoId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.videoRepository.findById(videoId);
        });
    }
    deleteVideo(videoId) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.videoRepository.delete(videoId);
        });
    }
}
exports.VideoService = VideoService;
