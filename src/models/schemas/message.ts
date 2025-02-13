import mongoose, { Types, Document, Schema } from "mongoose";

interface MessageReaction {
  userId: Types.ObjectId;
  emoji: string;
}

export interface MessageReply {
  messageId: Types.ObjectId;
  userId: Types.ObjectId;
  content?: string;
  fileUrl: string;
  messageType: any;
  createdAt: Date;
}

export interface Message extends Document {
  channelId: Types.ObjectId;
  senderId: Types.ObjectId;
  content: string;
  messageType: "text" | "image" | "video" | "file";
  fileUrl?: string;
  reactions: MessageReaction[];
  status: string;
  replies: MessageReply[];
  replyTo?: any;
  isEdited: boolean;
  createdAt: Date;
  updatedAt: Date;
  mentions: any[];
}

const MessageSchema = new Schema<Message>(
  {
    channelId: { type: Schema.Types.ObjectId, ref: "Channel", required: true },
    senderId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, default: "" },
    status: { type: String, default: "active" },
    messageType: {
      type: String,
      enum: ["text", "image", "video", "file"],
      default: "text",
    },
    fileUrl: { type: String, default: "" },
    reactions: [
      {
        userId: { type: Schema.Types.ObjectId, ref: "User" },
        emoji: String,
      },
    ],
    replies: [
      {
        messageId: { type: Schema.Types.ObjectId, ref: "Message" },
        userId: { type: Schema.Types.ObjectId, ref: "User" },
        content: String,
        fileUrl: String,
        messageType: {
          type: String,
          enum: ["text", "image"],
          default: "text",
        },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    replyTo: { type: Schema.Types.ObjectId, ref: "Message" },
    isEdited: { type: Boolean, default: false },
    mentions: [
      {
        userId: { type: Schema.Types.ObjectId, ref: "User" },
        name: String,
      },
    ],
  },
  { timestamps: true }
);

MessageSchema.index({ channelId: 1, createdAt: -1 });
MessageSchema.index({ senderId: 1, createdAt: -1 });

export default mongoose.model<Message>("Message", MessageSchema);
