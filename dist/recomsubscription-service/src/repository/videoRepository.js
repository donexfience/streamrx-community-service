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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VideoRepository = void 0;
const video_1 = __importDefault(require("../modals/schema/video"));
class VideoRepository {
    create(videoData) {
        return __awaiter(this, void 0, void 0, function* () {
            const video = new video_1.default(videoData);
            return yield video.save();
        });
    }
    update(videoId, updateData) {
        return __awaiter(this, void 0, void 0, function* () {
            const video = yield video_1.default.findByIdAndUpdate(videoId, updateData, {
                new: true,
            });
            if (!video)
                throw new Error("Video not found");
            return video;
        });
    }
    delete(videoId) {
        return __awaiter(this, void 0, void 0, function* () {
            yield video_1.default.findByIdAndDelete(videoId);
        });
    }
    getAll() {
        return __awaiter(this, arguments, void 0, function* (skip = 0, limit = 10) {
            try {
                const videos = yield video_1.default.find()
                    .sort({ createdAt: -1 })
                    .skip(skip)
                    .limit(limit)
                    .populate("channelId")
                    .lean();
                return videos;
            }
            catch (error) {
                console.error("Error in VideoRepository.getAll:", error);
                throw error;
            }
        });
    }
    findById(videoId) {
        return __awaiter(this, void 0, void 0, function* () {
            const video = yield video_1.default.findById(videoId);
            if (!video)
                throw new Error("Video not found");
            return video;
        });
    }
    findByQuery(filter) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield video_1.default.find(filter)
                    .sort({ createdAt: -1 })
                    .populate("channelId")
                    .lean();
            }
            catch (error) {
                console.error("Error in VideoRepository.findByQuery:", error);
                throw error;
            }
        });
    }
    findByQuerys(filter) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(filter, "filter i got here ");
            try {
                const { $orderby, $limit } = filter, queryFilter = __rest(filter, ["$orderby", "$limit"]);
                console.log($orderby, "order", $limit, "limit", queryFilter, "dfdsfsdfsfsdf");
                let query = video_1.default.find(queryFilter);
                if ($orderby) {
                    query = query.sort($orderby);
                }
                if ($limit) {
                    query = query.limit($limit);
                }
                return yield query.populate("channelId").lean();
            }
            catch (error) {
                console.error("Error in VideoRepository.findByQuery:", error);
                throw error;
            }
        });
    }
}
exports.VideoRepository = VideoRepository;
