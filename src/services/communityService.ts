import { Types } from "mongoose";
import { CommunityChatMessageRepository } from "../repository/communityChatRepository";
import Message, { Message as MessageType } from "../models/schemas/message";

export class CommunityChatMessageService {
  constructor(private messageRepository: CommunityChatMessageRepository) {}

  async sendMessage(messageData: Partial<MessageType>): Promise<MessageType> {
    if (messageData.replyTo?._id) {
      const parentMessage = await Message.findById(messageData.replyTo._id);
      if (!parentMessage) {
        throw new Error("Parent message not found");
      }
      const newMessage = await this.messageRepository.createMessage({
        ...messageData,
        replyTo: messageData.replyTo._id,
      });

      await Message.findByIdAndUpdate(
        messageData.replyTo._id,
        {
          $push: {
            replies: {
              messageId: newMessage._id,
              userId: messageData.senderId,
              content: messageData.content,
              fileUrl: messageData.fileUrl,
              messageType: messageData.messageType || "text",
              createdAt: new Date(),
            },
          },
        },
        { new: true }
      );

      return newMessage;
    }

    return await this.messageRepository.createMessage(messageData);
  }

  async getChannelMessages(channelId: string, page = 1, limit = 50) {
    const skip = (page - 1) * limit;
    const message = await this.messageRepository.getChannelMessages(
      channelId,
      limit,
      skip
    );
    console.log(message, "message at last in the service ");
    return message;
  }

  async editMessage(
    messageId: Types.ObjectId,
    content: string
  ): Promise<MessageType | null> {
    return await this.messageRepository.updateMessage(messageId, { content });
  }

  async deleteMessage(messageId: Types.ObjectId): Promise<boolean | null> {
    return await this.messageRepository.deleteMessage(messageId);
  }

  async handleReaction(
    messageId: Types.ObjectId,
    userId: Types.ObjectId,
    emoji: string
  ): Promise<MessageType | null> {
    return await this.messageRepository.addReaction(messageId, userId, emoji);
  }

  async replyToMessage(
    messageId: Types.ObjectId,
    replyData: {
      userId: Types.ObjectId;
      content: string;
      fileUrl?: string;
      messageType?: "text" | "image";
    }
  ): Promise<MessageType | null> {
    return await this.messageRepository.addReply(messageId, {
      ...replyData,
      messageId,
      createdAt: new Date(),
    });
  }
}
