"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.communityService = void 0;
class communityService {
    constructor(channelRepository, userRepository) {
        this.channelRepository = channelRepository;
        this.userRepository = userRepository;
    }
}
exports.communityService = communityService;
