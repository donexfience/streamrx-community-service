import mongoose, { Types, Document, Schema } from "mongoose";

interface MessageReaction {
  userId: Types.ObjectId;
  emoji: string;
}

interface MessageReply {
  messageId: Types.ObjectId;
  userId: Types.ObjectId;
  content: string;
  createdAt: Date;
}

export interface Message extends Document {
  channelId: Types.ObjectId;
  senderId: Types.ObjectId;
  content: string;
  messageType: 'text' | 'image' | 'video' | 'file';
  fileUrl?: string;
  reactions: MessageReaction[];
  replies: MessageReply[];
  replyTo?: Types.ObjectId;
  isEdited: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema<Message>(
  {
    channelId: { type: Schema.Types.ObjectId, ref: 'Channel', required: true },
    senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    messageType: { 
      type: String, 
      enum: ['text', 'image', 'video', 'file'], 
      default: 'text' 
    },
    fileUrl: { type: String },
    reactions: [{
      userId: { type: Schema.Types.ObjectId, ref: 'User' },
      emoji: String
    }],
    replies: [{
      messageId: { type: Schema.Types.ObjectId, ref: 'Message' },
      userId: { type: Schema.Types.ObjectId, ref: 'User' },
      content: String,
      createdAt: { type: Date, default: Date.now }
    }],
    replyTo: { type: Schema.Types.ObjectId, ref: 'Message' },
    isEdited: { type: Boolean, default: false }
  },
  { timestamps: true }
);

MessageSchema.index({ channelId: 1, createdAt: -1 });
MessageSchema.index({ senderId: 1, createdAt: -1 });

export default mongoose.model<Message>('Message', MessageSchema);
