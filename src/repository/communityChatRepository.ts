import { Types } from "mongoose";
import Message, { Message as MessageType } from "../models/schemas/message";

export class CommunityChatMessageRepository {
  async findById(messageId: string): Promise<MessageType | null> {
    return Message.findById(messageId)
      .populate("senderId", "name profileImage")
      .populate("replies.userId", "name profileImage")
      .populate("replyTo");
  }

  async findByChannelId(
    channelId: string,
    page: number,
    limit: number
  ): Promise<{ messages: MessageType[]; total: number }> {
    const skip = (page - 1) * limit;

    const [messages, total] = await Promise.all([
      Message.find({ channelId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("senderId", "name profileImage")
        .populate("replies.userId", "name profileImage")
        .populate("replyTo"),
      Message.countDocuments({ channelId }),
    ]);

    return { messages, total };
  }

  async create(messageData: Partial<MessageType>): Promise<MessageType> {
    const message = new Message(messageData);
    await message.save();
    const plainDocument = message.toObject();
    return plainDocument;
  }

  async update(
    messageId: string,
    updateData: Partial<MessageType>
  ): Promise<MessageType | null> {
    const message = await Message.findByIdAndUpdate(
      messageId,
      { $set: updateData },
      { new: true }
    )
      .populate("senderId", "name profileImage")
      .populate("replies.userId", "name profileImage");

    return message;
  }

  async delete(messageId: string): Promise<boolean> {
    const result = await Message.deleteOne({ _id: messageId });
    return result.deletedCount === 1;
  }

  async addReaction(
    messageId: string,
    userId: string,
    emoji: string
  ): Promise<MessageType | null> {
    const message = await Message.findById(messageId);
    if (!message) return null;

    const existingReactionIndex = message.reactions.findIndex(
      (reaction) => reaction.userId.toString() === userId
    );

    if (existingReactionIndex > -1) {
      message.reactions.splice(existingReactionIndex, 1);
    }

    message.reactions.push({
      userId: new Types.ObjectId(userId),
      emoji,
    });

    await message.save();
    return this.findById(messageId);
  }

  async addReply(
    messageId: string,
    userId: string,
    content: string
  ): Promise<MessageType | null> {
    const message = await Message.findById(messageId);
    if (!message) return null;

    message.replies.push({
      messageId: new Types.ObjectId(messageId),
      userId: new Types.ObjectId(userId),
      content,
      createdAt: new Date(),
    });

    await message.save();
    return this.findById(messageId);
  }

  async findUserMessages(
    userId: string,
    channelId: string
  ): Promise<MessageType[]> {
    return Message.find({
      channelId,
      senderId: userId,
    }).sort({ createdAt: -1 });
  }
}
