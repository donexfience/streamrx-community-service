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
exports.PlaylistRepository = void 0;
const playlist_1 = __importDefault(require("../modals/schema/playlist"));
class PlaylistRepository {
    create(playlistData) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(playlistData, "playlist data in the repository");
            const playlist = new playlist_1.default(playlistData);
            return yield playlist.save();
        });
    }
    update(playlistId, updateData) {
        return __awaiter(this, void 0, void 0, function* () {
            const playlist = yield playlist_1.default.findByIdAndUpdate(playlistId, updateData, {
                new: true,
            });
            if (!playlist)
                throw new Error("Playlist not found");
            return playlist;
        });
    }
    delete(playlistId) {
        return __awaiter(this, void 0, void 0, function* () {
            yield playlist_1.default.findByIdAndDelete(playlistId);
        });
    }
    getAll() {
        return __awaiter(this, arguments, void 0, function* (skip = 0, limit = 10, channelId) {
            try {
                const playlists = yield playlist_1.default.find({ channelId: channelId })
                    .populate("videos.videoId")
                    .skip(skip)
                    .limit(limit)
                    .lean();
                return playlists;
            }
            catch (error) {
                console.error("Error in PlaylistRepository.getAll:", error);
                throw error;
            }
        });
    }
    findById(playlistId) {
        return __awaiter(this, void 0, void 0, function* () {
            const playlist = yield playlist_1.default.findById(playlistId).populate("videos.videoId");
            if (!playlist)
                throw new Error("Playlist not found");
            return playlist;
        });
    }
    findByQuery(filter) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield playlist_1.default.find(filter)
                    .sort({ createdAt: -1 })
                    .populate("channelId")
                    .populate("videos.videoId")
                    .lean();
            }
            catch (error) {
                console.error("Error in PlaylistRepository.findByQuery:", error);
                throw error;
            }
        });
    }
}
exports.PlaylistRepository = PlaylistRepository;
