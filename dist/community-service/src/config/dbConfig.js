"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.dbConfig = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.dbConfig = {
    host: process.env.MONGO_URI || "localhost",
    port: Number(process.env.DB_PORT) || 27017,
    database: process.env.DB_NAME || "Cartdatabase",
    uri: `mongodb+srv://donex6fience:${process.env.MONGO_CLUSTER_PASS}@auth.bbdo8.mongodb.net/?retryWrites=true&w=majority&appName=AUTH`
};
