"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const videoNodeSchema = new mongoose_1.Schema({
    videoId: { type: mongoose_1.Schema.Types.ObjectId, ref: "Video", required: true },
    next: { type: mongoose_1.Schema.Types.ObjectId, ref: "Video", default: null },
    prev: { type: mongoose_1.Schema.Types.ObjectId, ref: "Video", default: null }
});
const playlistSchema = new mongoose_1.Schema({
    channelId: { type: mongoose_1.Schema.Types.ObjectId, ref: "Channel", required: true },
    name: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        required: true,
        trim: true,
        maxlength: 5000,
    },
    visibility: {
        type: String,
        enum: ["public", "private", "unlisted"],
        default: "private",
        required: true,
    },
    category: {
        type: String,
        required: true,
        trim: true,
    },
    tags: [
        {
            type: String,
            trim: true,
        },
    ],
    thumbnailUrl: {
        type: String,
        required: true,
    },
    videos: [videoNodeSchema],
    status: {
        type: String,
        enum: ["active", "deleted"],
        default: "active",
    },
}, {
    timestamps: true,
});
// Indexes for better query performance
playlistSchema.index({ channelId: 1, createdAt: -1 });
playlistSchema.index({ visibility: 1, category: 1 });
playlistSchema.index({ status: 1 });
const Playlist = mongoose_1.default.model("Playlist", playlistSchema);
exports.default = Playlist;
