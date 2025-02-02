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
  }
}
