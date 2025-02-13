import { Request, RequestHandler, Response } from "express";
import { CommunityChatMessageService } from "../services/communityService";

export class ChatController {
  constructor(private messageService: CommunityChatMessageService) {}

  getChannelMessages: RequestHandler = async (req, res, next) => {
    try {
      const channelId = req.params.channelId;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;

      const messages = await this.messageService.getChannelMessages(
        channelId,
        page,
        limit
      );

      res.status(200).json({
        status: "success",
        data: {
          messages,
          page,
          limit,
        },
      });
    } catch (error) {
      res.status(500).json({
        status: "error",
        message: "Failed to fetch channel messages",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };
}
