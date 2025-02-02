import { Request, Response } from "express";
import { CommunityChatMessageService } from "../services/communityService";

export class ChatController {
  constructor(private messageService: CommunityChatMessageService) {}

  async getChannelMessages(req: Request, res: Response) {
    try {
      const { channelId } = req.params;
      const { page = 1, limit = 50 } = req.query;

      const result = await this.messageService.getChannelMessages(
        channelId,
        Number(page),
        Number(limit)
      );

      res.json(result);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  }

  async createMessage(req: Request, res: Response) {
    try {
      const messageData = req.body;
      const message = await this.messageService.createMessage(messageData);
      res.status(201).json(message);
    } catch (error) {
      res.status(500).json({ message: "Failed to create message" });
    }
  }

  async updateMessage(req: Request, res: Response) {
    try {
      const { messageId } = req.params;
      const { userId, content } = req.body;

      const message = await this.messageService.updateMessage(
        messageId,
        userId,
        content
      );

      res.json(message);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to update message";
      res.status(500).json({ message });
    }
  }

  async deleteMessage(req: Request, res: Response) {
    try {
      const { messageId } = req.params;
      const { userId } = req.body;

      await this.messageService.deleteMessage(messageId, userId);
      res.json({ message: "Message deleted successfully" });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to delete message";
      res.status(500).json({ message });
    }
  }

  async addReaction(req: Request, res: Response) {
    try {
      const { messageId } = req.params;
      const { userId, emoji } = req.body;

      const message = await this.messageService.addReaction(
        messageId,
        userId,
        emoji
      );

      res.json(message);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to add reaction";
      res.status(500).json({ message });
    }
  }

  async addReply(req: Request, res: Response) {
    try {
      const { messageId } = req.params;
      const { userId, content } = req.body;

      const message = await this.messageService.addReply(
        messageId,
        userId,
        content
      );

      res.json(message);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to add reply";
      res.status(500).json({ message });
    }
  }
}
