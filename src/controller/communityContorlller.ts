import { Request, Response } from "express";
import { CommunityChatMessageService } from "../services/communityService";

export class ChatController {
  constructor(private messageService: CommunityChatMessageService) {}
}
