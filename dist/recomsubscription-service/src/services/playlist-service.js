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
exports.PlaylistService = void 0;
class PlaylistService {
    constructor(playlistRepository) {
        this.playlistRepository = playlistRepository;
    }
    createPlaylist(playlistData) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield this.playlistRepository.create(playlistData);
            }
            catch (error) {
                throw new Error(`Failed to create playlist: ${error.message}`);
            }
        });
    }
    getAllPlaylists() {
        return __awaiter(this, arguments, void 0, function* (page = 1, limit = 10, channelId) {
            const skip = (page - 1) * limit;
            return yield this.playlistRepository.getAll(skip, limit, channelId);
        });
    }
    getPlaylistById(playlistId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.playlistRepository.findById(playlistId);
        });
    }
    getPlayListByTitle(title) {
        return __awaiter(this, void 0, void 0, function* () {
            const filter = title ? { name: { $regex: title, $options: "i" } } : {};
            return yield this.playlistRepository.findByQuery(filter);
        });
    }
    updatePlaylist(playlistId, updateData) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.playlistRepository.update(playlistId, updateData);
        });
    }
    deletePlaylist(playlistId) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.playlistRepository.delete(playlistId);
        });
    }
}
exports.PlaylistService = PlaylistService;
