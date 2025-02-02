import { Types } from "mongoose";
import Message, {
  MessageReply,
  Message as MessageType,
} from "../models/schemas/message";

export class CommunityChatMessageRepository {
  async createMessage(messageData: Partial<MessageType>): Promise<MessageType> {
    const message = new Message(messageData);
    return await message.save();
  }

  async getChannelMessages(
    channelId: string,
    page: number = 1,
    limit: number = 50
  ) {
    try {
      const skip = (page - 1) * limit;
      console.log(channelId, "id in the repository");

      const messages = await Message.find({ channelId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate({
          path: "senderId",
          model: "User",
          select: "_id username profileImageURL",
        })
        .populate({
          path: "replyTo",
          model: "Message",
          populate: {
            path: "senderId",
            model: "User",
            select: "_id username profileImageURL",
          },
        })
        .lean();
      console.log(messages, "got messagees after the data operation");
      const transformedMessages = messages.map((message) => {
        const reactionMap = new Map();

        message.reactions.forEach((reaction) => {
          if (!reactionMap.has(reaction.emoji)) {
            reactionMap.set(reaction.emoji, {
              emoji: reaction.emoji,
              users: [],
            });
          }
          reactionMap
            .get(reaction.emoji)
            .users.push(reaction.userId.toString());
        });

        return {
          ...message,
          reactions: Array.from(reactionMap.values()),
          replyTo: message.replyTo
            ? {
                _id: message.replyTo._id,
                content: message.replyTo.content,
                senderId: {
                  name: message.replyTo.senderId?.name,
                },
              }
            : undefined,
        };
      });

      return transformedMessages.reverse();
    } catch (error) {
      console.error("Error fetching channel messages:", error);
      throw new Error("Failed to fetch channel messages");
    }
  }

  async updateMessage(
    messageId: Types.ObjectId,
    update: Partial<MessageType>
  ): Promise<MessageType | null> {
    return await Message.findByIdAndUpdate(
      messageId,
      { ...update, isEdited: true },
      { new: true }
    ).populate("senderId", "name profileImage");
  }

  async addReaction(
    messageId: Types.ObjectId,
    userId: Types.ObjectId,
    emoji: string
  ): Promise<MessageType | null> {
    const message = await Message.findById(messageId);
    if (!message) return null;

    const existingReactionIndex = message.reactions.findIndex(
      (reaction) =>
        reaction.userId.toString() === userId.toString() &&
        reaction.emoji === emoji
    );

    if (existingReactionIndex > -1) {
      message.reactions.splice(existingReactionIndex, 1);
    } else {
      message.reactions.push({ userId, emoji });
    }

    return await message.save();
  }

  async addReply(
    messageId: Types.ObjectId,
    replyData: Partial<MessageReply>
  ): Promise<MessageType | null> {
    return await Message.findByIdAndUpdate(
      messageId,
      { $push: { replies: replyData } },
      { new: true }
    ).populate("senderId", "name profileImage");
  }

  async deleteMessage(messageId: Types.ObjectId): Promise<boolean> {
    const result = await Message.deleteOne({ _id: messageId });
    return result.deletedCount > 0;
  }
}
