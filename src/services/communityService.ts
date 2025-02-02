import { Types } from "mongoose";
import { CommunityChatMessageRepository } from "../repository/communityChatRepository";
import Message, { Message as MessageType } from "../models/schemas/message";

export class CommunityChatMessageService {
  constructor(private messageRepository: CommunityChatMessageRepository) {}

  async getChannelMessages(
    channelId: string,
    page: number = 1,
    limit: number = 50
  ) {
    try {
      const { messages, total } = await this.messageRepository.findByChannelId(
        channelId,
        page,
        limit
      );

      return {
        messages,
        total,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      throw new Error("Failed to fetch channel messages");
    }
  }

  async createMessage(messageData: Partial<MessageType>) {
    try {
      const newMessage = {
        ...messageData,
        channelId: new Types.ObjectId(messageData.channelId),
        senderId: new Types.ObjectId(messageData.senderId),
        replyTo: messageData.replyTo
          ? new Types.ObjectId(messageData.replyTo)
          : undefined,
      };

      return await this.messageRepository.create(newMessage);
    } catch (error) {
      throw new Error("Failed to create message");
    }
  }

  async updateMessage(messageId: string, userId: string, content: string) {
    try {
      const message = await this.messageRepository.findById(messageId);

      if (!message) {
        throw new Error("Message not found");
      }

      if (message.senderId.toString() !== userId) {
        throw new Error("Unauthorized to edit this message");
      }

      return await this.messageRepository.update(messageId, {
        content,
        isEdited: true,
      });
    } catch (error) {
      throw new Error("Failed to update message");
    }
  }

  async deleteMessage(messageId: string, userId: string) {
    try {
      const message = await this.messageRepository.findById(messageId);

      if (!message) {
        throw new Error("Message not found");
      }

      if (message.senderId.toString() !== userId) {
        throw new Error("Unauthorized to delete this message");
      }

      return await this.messageRepository.delete(messageId);
    } catch (error) {
      throw new Error("Failed to delete message");
    }
  }

  async addReaction(messageId: string, userId: string, emoji: string) {
    try {
      const updatedMessage = await this.messageRepository.addReaction(
        messageId,
        userId,
        emoji
      );

      if (!updatedMessage) {
        throw new Error("Message not found");
      }

      return updatedMessage;
    } catch (error) {
      throw new Error("Failed to add reaction");
    }
  }

  async addReply(messageId: string, userId: string, content: string) {
    try {
      const updatedMessage = await this.messageRepository.addReply(
        messageId,
        userId,
        content
      );

      if (!updatedMessage) {
        throw new Error("Message not found");
      }

      return updatedMessage;
    } catch (error) {
      throw new Error("Failed to add reply");
    }
  }
}
