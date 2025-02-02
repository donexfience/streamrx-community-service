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
exports.UserRepository = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const user_1 = __importDefault(require("../models/schemas/user"));
class UserRepository {
    create(user) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(user, "userData in repository");
            if (user._id && typeof user._id === "string") {
                user._id = new mongoose_1.default.Types.ObjectId(user._id);
            }
            const newUser = new user_1.default(user);
            console.log(newUser, "newUser in repository");
            return yield newUser.save();
        });
    }
    findByEmail(email) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield user_1.default.findOne({ email }).exec();
        });
    }
    findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield user_1.default.findById(id).exec();
        });
    }
    updateById(id, updateData) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield user_1.default.findByIdAndUpdate(id, updateData, {
                new: true,
            }).exec();
        });
    }
}
exports.UserRepository = UserRepository;
