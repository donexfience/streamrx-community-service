import { Router } from "express";
import { CommunityChatMessageService } from "../services/communityService";
import { UserRepository } from "../repository/userRepository";
import { CommunityChatMessageRepository } from "../repository/communityChatRepository";
import { ChatController } from "../controller/communityContorlller";

export class CommunityChatRoutes {
  public router: Router;

  constructor() {
    this.router = Router();
    this.initRoutes();
  }

  private async initRoutes() {
    const communityChatMessageRepository = new CommunityChatMessageRepository();
    const userRepository = new UserRepository();
    const communityChatMessageService = new CommunityChatMessageService(
      communityChatMessageRepository
    );

    const chatController = new ChatController(communityChatMessageService);

    this.router.get(
      "/channel/:channelId/messages",
      chatController.getChannelMessages.bind(chatController)
    );
    this.router.post(
      "/messages",
      chatController.createMessage.bind(chatController)
    );
    this.router.put(
      "/messages/:messageId",
      chatController.updateMessage.bind(chatController)
    );
    this.router.delete(
      "/messages/:messageId",
      chatController.deleteMessage.bind(chatController)
    );
    this.router.post(
      "/messages/:messageId/reaction",
      chatController.addReaction.bind(chatController)
    );
    this.router.post(
      "/messages/:messageId/reply",
      chatController.addReply.bind(chatController)
    );
  }
}
