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
exports.Database = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const dbConfig_1 = require("./dbConfig");
class Database {
    static connect() {
        return __awaiter(this, void 0, void 0, function* () {
            const { host, port, database, uri } = dbConfig_1.dbConfig;
            console.log(port, host, database, uri, "debug purpose");
            const connectionString = process.env.mongoURI || `mongodb://${host}:${port}/${database}`;
            console.log(connectionString, "string");
            try {
                yield mongoose_1.default.connect(connectionString);
                console.log("Database connected successfully");
            }
            catch (error) {
                console.error("Database connection error:", error);
                process.exit(1);
            }
        });
    }
}
exports.Database = Database;
